#!/bin/bash
if [ -z "$1" ]; then
    echo "Usage: ./switch_model.sh <model-name>"
    exit 1
fi
MODEL="$1"
echo "Switching Person 2 to: $MODEL"
echo "export PERSON2_MODEL=$MODEL" >> ~/.zshrc
source ~/.zshrc
echo "Done. Test with:"
echo "  python3 -c 'from person2_ai import generate_tip; print(generate_tip(\"battery\"))'"
