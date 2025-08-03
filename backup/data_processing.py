#!/usr/bin/env python3

import pandas as pd
import numpy as np
from datetime import datetime
from scipy import stats

def load_and_explore_data():
    """Load the Online Retail dataset and explore its structure"""
    print("Loading Online Retail dataset...")
    df = pd.read_excel('Online_Retail.xlsx')
    
    print(f"Dataset shape: {df.shape}")
    print(f"\nColumns: {df.columns.tolist()}")
    print(f"\nData types:\n{df.dtypes}")
    print(f"\nFirst few rows:")
    print(df.head())
    print(f"\nBasic statistics:")
    print(df.describe())
    print(f"\nMissing values:")
    print(df.isnull().sum())
    
    return df

def preprocess_data(df):
    """Remove returns and aggregate data by StockCode"""
    print("\nPreprocessing data...")
    
    # Remove returns (Quantity < 0)
    initial_rows = len(df)
    df_clean = df[df['Quantity'] > 0].copy()
    print(f"Removed {initial_rows - len(df_clean)} return rows")
    
    # Remove rows with missing CustomerID or StockCode
    df_clean = df_clean.dropna(subset=['CustomerID', 'StockCode'])
    print(f"Remaining rows after cleaning: {len(df_clean)}")
    
    # Convert InvoiceDate to datetime if not already
    df_clean['InvoiceDate'] = pd.to_datetime(df_clean['InvoiceDate'])
    
    # Calculate total sales for each row
    df_clean['TotalSales'] = df_clean['Quantity'] * df_clean['UnitPrice']
    
    # Aggregate by StockCode
    print("Aggregating by StockCode...")
    aggregated = df_clean.groupby('StockCode').agg({
        'UnitPrice': 'mean',  # avgPrice
        'Quantity': 'sum',    # totalQty
        'TotalSales': 'sum',  # totalSales
        'Country': lambda x: x.mode().iloc[0] if len(x.mode()) > 0 else x.iloc[0],  # mainCountry (mode)
        'Description': 'first',  # product description
        'InvoiceDate': ['min', 'max', 'count'],  # for RFM calculation
        'CustomerID': 'nunique'  # unique customers
    }).round(2)
    
    # Flatten column names
    aggregated.columns = ['avgPrice', 'totalQty', 'totalSales', 'mainCountry', 
                         'Description', 'firstPurchase', 'lastPurchase', 'frequency', 'uniqueCustomers']
    
    print(f"Aggregated dataset shape: {aggregated.shape}")
    print("\nAggregated data sample:")
    print(aggregated.head())
    
    return df_clean, aggregated

def calculate_rfm_metrics(df_clean, aggregated):
    """Calculate RFM metrics for each product"""
    print("\nCalculating RFM metrics...")
    
    # Get the maximum date in the dataset as reference
    max_date = df_clean['InvoiceDate'].max()
    print(f"Reference date for recency calculation: {max_date}")
    
    # Calculate Recency (days since last purchase)
    aggregated['Recency'] = (max_date - aggregated['lastPurchase']).dt.days
    
    # Frequency is already calculated (number of transactions)
    # Monetary is the totalSales
    aggregated['Monetary'] = aggregated['totalSales']
    
    print("RFM metrics calculated:")
    print(f"Recency range: {aggregated['Recency'].min()} - {aggregated['Recency'].max()} days")
    print(f"Frequency range: {aggregated['frequency'].min()} - {aggregated['frequency'].max()} transactions")
    print(f"Monetary range: ${aggregated['Monetary'].min():.2f} - ${aggregated['Monetary'].max():.2f}")
    
    return aggregated

def main():
    # Load and explore data
    df = load_and_explore_data()
    
    # Preprocess data
    df_clean, aggregated = preprocess_data(df)
    
    # Calculate RFM metrics
    final_data = calculate_rfm_metrics(df_clean, aggregated)
    
    # Save processed data
    final_data.to_csv('processed_retail_data.csv')
    print(f"\nProcessed data saved to 'processed_retail_data.csv'")
    print(f"Final dataset shape: {final_data.shape}")
    
    return final_data

if __name__ == "__main__":
    processed_data = main()