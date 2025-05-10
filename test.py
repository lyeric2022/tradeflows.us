import pandas as pd

def count_countries(file_path):
    # Read the CSV file
    df = pd.read_csv(file_path)
    
    # Assuming there's a column named 'country' or similar
    country_column = 'partnerDesc'  # Change this to match your column name
    
    # Count unique countries
    unique_countries = df[country_column].nunique()
    
    return unique_countries

# Example usage
file_path = 'data/processed/trade_flows.csv'
num_countries = count_countries(file_path)
print(f"There are {num_countries} unique countries in the dataset.")