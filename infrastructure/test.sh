# Set your source and destination table names
source_table_name="GenAI-Backend-ConversationHistory982F6F27-H9MHNHPTV6N6"
destination_table_name="GenAI-Backend-ConversationHistory982F6F27-4OBQ6UIGX7CR"

# Set your AWS regions
source_region="us-east-2"
destination_region="us-east-1"

# Use the scan command to retrieve all items from the source table
aws dynamodb scan \
  --table-name $source_table_name \
  --region $source_region \
  --output json \
  > scan_output.json

# Use jq to extract the "Items" array from the scan output
jq '.Items' scan_output.json > items.json

# Use the batch-write-item command to write items to the destination table
aws dynamodb batch-write-item \
  --request-items file://items.json \
  --region $destination_region \
  --request-items file://items.json
