import pandas as pd

data_path = '../data/Online_Retail.xlsx'
df = pd.read_excel(data_path)
df['InvoiceDate'] = pd.to_datetime(df['InvoiceDate'], errors='coerce')
df = df[df['Quantity'] > 0]
df = df.dropna(subset=['InvoiceDate', 'StockCode', 'Description', 'Country', 'UnitPrice', 'Quantity'])
df['TotalPrice'] = df['Quantity'] * df['UnitPrice']

df['InvoiceMonth'] = df['InvoiceDate'].dt.to_period('M')
monthly_trend = df.groupby(['InvoiceMonth', 'StockCode', 'Description']).agg({
    'Quantity': 'sum',
    'TotalPrice': 'sum'
}).reset_index()
monthly_trend['InvoiceMonth'] = monthly_trend['InvoiceMonth'].dt.to_timestamp()
monthly_trend.to_csv('../data/monthly_trend.csv', index=False)

