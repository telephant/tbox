[type in Resume and JD]
          │
          ▼
[LLM generate first version of Cover Letter]
          │
          ▼
[ User check it and give feedback]
          │
          ▼
[Prase, analyse and classify feedback]
          │
          ▼
[Adjust Prompt dynamicly + Update user profile]
          │
          ▼
[Save the result, generate data for google Colab]
          │
          ▼
[周期性增量微调模型]
          │
          └───────────────────────┐
                                  │
                                  ▼
                  [Generate better Cover Letter]
                                  │
                                  ▼
              (Back to `User check it and give feedback` and loop)
