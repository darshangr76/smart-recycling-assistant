from person2_ai import generate_tip, track_item, get_stats

# Simulate Person 1's output
mock_labels = ["plastic bottle", "cardboard box", "banana peel", "glass jar"]

print("🧪 Testing full pipeline with mock labels...\n")

for label in mock_labels:
    tip = generate_tip(label)
    track_item(label)
    print(f"✅ {label}: {tip[:60]}...")

print("\n📊 Digital Twin Stats:")
print(get_stats())
