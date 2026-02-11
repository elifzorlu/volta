# Volta ⚡  
**Personal Productivity Intelligence — built by a machine learning student**

Volta is an ML-driven productivity system that learns patterns from behavioral data and turns them into decision-focused insights.

Not a dashboard.  
Not a habit tracker.  
Not “AI for vibes.”

Volta is about answering questions like:

- When am I actually most effective?
- Does sleeping 6h vs 8h change my next-day output?
- Is caffeine helping or hurting deep work?
- What would happen if I shifted my schedule?

The goal is to move from **tracking → modeling → decision intelligence.**

---

## 🌐 Live Demo

https://volta-productivity.com  

*(Front-end prototype currently live)*

---

## 🚧 Current Stage

Volta is currently in **Stage 1 – Product Foundation → Transitioning to ML Backend.**

### ✅ Implemented
- Front-end web app (React + Vite)
- Manual productivity logging interface
- Structured behavioral data schema
- Deployment (Netlify + custom domain)
- Repository structure prepared for backend integration

### 🔄 In Progress
- Persistent user data storage (Supabase / DB)
- Backend API (FastAPI)
- Feature engineering pipeline
- First baseline trainable model

Volta is moving from **UI prototype → ML system.**

---

## 🧠 Technical Direction

### Core Modeling Idea

Daily behavioral metrics are modeled as time-series sequences.

**Inputs (per day):**
- Sleep duration
- Caffeine intake
- Study/work duration
- Screen time
- Schedule distribution
- (Future: energy score, context tags, biometrics)

**Outputs:**
- Predicted productivity score
- Confidence level
- Counterfactual insights  
  (“If sleep +1h → expected +X% productivity”)

---

## 🏗 Planned Architecture

### Frontend
- React + Vite
- Minimal dark UI
- Decision-focused UX (not analytics-heavy dashboards)

### Backend (In Progress)
- Python (FastAPI)
- PyTorch LSTM time-series model
- ONNX export for optimized inference
- CUDA acceleration for training experiments

### Data
- User-specific time-series modeling
- Rolling window sequence training
- Feature scaling + normalization pipeline

---

## 🔬 Machine Learning Roadmap

### Phase 1 – Baseline Modeling
- Train LSTM on synthetic + self-logged data
- Evaluate MAE / MSE for next-day productivity prediction
- Add uncertainty estimation (sample size + variance aware)

### Phase 2 – Personalization
- Per-user fine-tuning
- Few-shot adaptation
- Confidence scoring calibration

### Phase 3 – Counterfactual Engine
- Simulate alternate sleep/caffeine schedules
- Generate “what-if” projections
- Show prediction confidence intervals

### Phase 4 – Performance Engineering
- Export model to ONNX
- Benchmark inference latency
- Compare CPU vs GPU inference cost
- Optimize throughput

This project is intentionally designed as an **end-to-end ML systems project**, not just a trained model.

---

## 📈 Long-Term Vision

Volta evolves into:

- A personalized decision engine
- A deployed ML system with measurable latency benchmarks
- A production-style time-series modeling experiment
- A portfolio-level ML systems case study

---

## 📌 Concrete Next Steps

- [ ] Implement FastAPI backend service
- [ ] Connect persistent database
- [ ] Build model training pipeline
- [ ] Create synthetic dataset generator
- [ ] Add evaluation metrics dashboard
- [ ] Implement ONNX export + benchmark script
- [ ] Add uncertainty calibration module
- [ ] Add model versioning system

---
## 📂 Repository Structure

```
volta/
│
├── frontend/          # React + Vite web app
├── backend/
│   ├── api/           # FastAPI routes
│   ├── models/        # PyTorch model definitions
│   ├── training/      # Training pipeline scripts
│   ├── inference/     # Inference + ONNX export
│   └── benchmarks/    # Latency & performance tests
│
├── data/              # Datasets (synthetic + user logs)
├── experiments/       # Model experiments & notebooks
└── README.md
```

---

## 👩‍💻 About

Built by a computer science student focused on:

- Machine learning systems
- Performance-aware model deployment
- Time-series modeling
- Turning research ideas into deployed systems

Volta is both a product and an evolving ML engineering experiment.

