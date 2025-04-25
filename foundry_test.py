import os
from dotenv import load_dotenv
from a_sdk import FoundryClient
from foundry_sdk_runtime.auth import UserTokenAuth

import requests
import json

# Load environment variables from .env file
load_dotenv()

hostname = "lyyeric.usw-18.palantirfoundry.com"
auth = UserTokenAuth(
    hostname=hostname,
    token=os.environ["FOUNDRY_TOKEN"]
)

client = FoundryClient(
    auth=auth, hostname=hostname
)

# Now send the raw POST request to loadTradeFlows
ontology_id = "ontology-d0e723e4-9394-4ded-a8a1-bcf9e2ccfe97"
url = f"https://{hostname}/api/v2/ontologies/{ontology_id}/queries/loadTradeFlows/execute"

payload = {
    "src_iso": "USA",
    "dst_iso": "CHN",
    "hs2": 85,
    "year": "time_2023"
}

headers = {
    "Authorization": f"Bearer {os.environ['FOUNDRY_TOKEN']}",
    "Content-Type": "application/json"
}

try:
    response = requests.post(url, headers=headers, json=payload)
    response.raise_for_status()  # This will raise an exception for 4xx and 5xx status codes
    print(json.dumps(response.json(), indent=2))
except requests.exceptions.RequestException as e:
    print(f"Error: {e}")
    print(f"Response status code: {response.status_code}")
    print(f"Response text: {response.text}")

# ------------------------------------------------------------
# Example Foundry SDK object query
auth = UserTokenAuth(
    hostname="https://lyyeric.usw-18.palantirfoundry.com",
    token=os.environ["FOUNDRY_TOKEN"]
)
client = FoundryClient(
    auth=auth, hostname="https://lyyeric.usw-18.palantirfoundry.com"
)

Flow_1Object = client.ontology.objects.Flow_1
print(Flow_1Object.take(1))

# GET a single Flow_1 record by primary key
primary_key = "USA_CHN_85_M_2023"
flow_record = client.ontology.objects.Flow_1.get(primary_key)
print("\n\n\n" + str(flow_record))

print("\n\n\n")

# Page through Flow_1 with a page size of 30
objects = client.ontology.objects.Flow_1.page(page_size=30)
for obj in objects:
    print(obj)