import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error
from sklearn.preprocessing import LabelEncoder

data_path = '../data/Online_Retail.xlsx'
df = pd.read_excel(data_path)

df['InvoiceDate'] = pd.to_datetime(df['InvoiceDate'], errors='coerce')
df = df[df['Quantity'] > 0]
df = df.dropna(subset=['InvoiceDate', 'StockCode', 'Country', 'UnitPrice', 'Quantity'])
df['TotalPrice'] = df['Quantity'] * df['UnitPrice']

df['InvoiceMonth'] = df['InvoiceDate'].dt.to_period('M')
df['InvoiceWeek'] = df['InvoiceDate'].dt.isocalendar().week
df['InvoiceDay'] = df['InvoiceDate'].dt.day

sku_total_qty = df.groupby('StockCode')['Quantity'].sum()
top_skus = sku_total_qty.sort_values(ascending=False).head(100).index
df_top = df[df['StockCode'].isin(top_skus)]

monthly_sales = df_top.groupby(['InvoiceMonth', 'StockCode', 'Description', 'Country']).agg({
    'Quantity': 'sum',
    'TotalPrice': 'sum',
    'UnitPrice': 'mean'
}).reset_index()

monthly_sales['InvoiceMonth'] = monthly_sales['InvoiceMonth'].dt.to_timestamp()
monthly_sales = monthly_sales.sort_values(['StockCode', 'Country', 'InvoiceMonth'])
monthly_sales['StockCode'] = monthly_sales['StockCode'].astype(str)
monthly_sales['Country'] = monthly_sales['Country'].astype(str)

monthly_sales['Target_NextMonthQty'] = monthly_sales.groupby(['StockCode', 'Country'])['Quantity'].shift(-1)
monthly_sales = monthly_sales.dropna(subset=['Target_NextMonthQty'])

monthly_sales['Qty_Mean_Last3Months'] = monthly_sales.groupby(['StockCode', 'Country'])['Quantity']\
    .transform(lambda x: x.rolling(window=3, min_periods=1).mean())

le_stock = LabelEncoder()
monthly_sales['StockCode_enc'] = le_stock.fit_transform(monthly_sales['StockCode'])
le_country = LabelEncoder()
monthly_sales['Country_enc'] = le_country.fit_transform(monthly_sales['Country'])

feature_cols = ['StockCode_enc', 'Country_enc', 'UnitPrice', 'Qty_Mean_Last3Months']
X = monthly_sales[feature_cols]
y = monthly_sales['Target_NextMonthQty']

X = X.apply(pd.to_numeric, errors='coerce').fillna(0)
y = pd.to_numeric(y, errors='coerce').fillna(0)

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
rf = RandomForestRegressor(n_estimators=100, max_depth=15, random_state=42, n_jobs=-1)
rf.fit(X_train, y_train)
y_pred = rf.predict(X_test)
mse = mean_squared_error(y_test, y_pred)
print(f"Test MSE: {mse:.4f}")

importances = rf.feature_importances_
for feat, imp in zip(feature_cols, importances):
    print(f"Feature: {feat}, Importance: {imp:.4f}")

last_month = monthly_sales['InvoiceMonth'].max()
print("Last available month in dataset:", last_month)

future_X = monthly_sales[monthly_sales['InvoiceMonth'] == last_month][feature_cols]
future_info = monthly_sales[monthly_sales['InvoiceMonth'] == last_month][['StockCode', 'Description', 'Country']]
future_pred = rf.predict(future_X)
future_results = future_info.copy()
future_results['Predicted_NextMonthQty'] = future_pred

top10_products = future_results.groupby(['StockCode', 'Description'])['Predicted_NextMonthQty'].sum() \
    .sort_values(ascending=False).head(10).reset_index()

print("\n=== Predicted Top 10 Product Sales (next month, all countries) ===")
print(top10_products[['StockCode', 'Description', 'Predicted_NextMonthQty']])

monthly_trend = monthly_sales.groupby('InvoiceMonth')['Quantity'].sum().reset_index()
predicted_total = future_results['Predicted_NextMonthQty'].sum()
future_month = pd.to_datetime(last_month) + pd.offsets.MonthBegin(1)
monthly_trend = pd.concat([
    monthly_trend,
    pd.DataFrame({'InvoiceMonth':[future_month], 'Quantity':[predicted_total]})
], ignore_index=True)

last_month_data = monthly_sales[monthly_sales['InvoiceMonth'] == last_month].copy()
last_month_data['avgPrice'] = last_month_data['UnitPrice']

last_date = df_top['InvoiceDate'].max()
recency_map = df_top.groupby('StockCode')['InvoiceDate'].max().apply(lambda d: (last_date - d).days).to_dict()
last_month_data['recency'] = last_month_data['StockCode'].map(recency_map).fillna(999)
freq_map = df_top[df_top['InvoiceDate'].dt.to_period('M') == last_month.to_period('M')].groupby('StockCode')['InvoiceNo'].nunique().to_dict()
last_month_data['freq'] = last_month_data['StockCode'].map(freq_map).fillna(1)
last_month_data['predictedQty'] = rf.predict(last_month_data[feature_cols])

def get_advice(recency, freq, avgPrice):
    if recency > 60:
        return "Clear"
    elif freq > 20 and avgPrice > 20:
        return "Push"
    else:
        return "Regular"

last_month_data['advice'] = last_month_data.apply(
    lambda row: get_advice(row['recency'], row['freq'], row['avgPrice']),
    axis=1
)

d3_columns = ['StockCode', 'Description', 'avgPrice', 'recency', 'freq', 'predictedQty', 'advice']
d3_data = last_month_data[d3_columns].copy()
d3_data = d3_data.sort_values('predictedQty', ascending=False).head(30)
d3_data.to_csv('../data/predicted_top_products.csv', index=False)

print(last_month_data['recency'].describe())
print((last_month_data['recency'] > 60).mean())
print((last_month_data['freq'] > 20).sum())
