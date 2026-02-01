Live Website - https://rag-xi-peach.vercel.app/

# <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/High%20Voltage.png" alt="Bolt" width="45" height="45" /> Lamda: Distributed Hybrid RAG

> **The Apex of Retrieval:** A high-throughput, distributed RAG platform that fuses private document intelligence with real-time web-scale search.

<div align="center">
  <img src="https://capsule-render.vercel.app/render?type=soft&color=auto&height=250&section=header&text=Lamda&fontSize=90&animation=fadeIn&fontAlignY=38" width="100%" />
</div>

<p align="center">
  <img src="https://img.shields.io/badge/Architecture-Distributed_Worker-6E40C9?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Search-Hybrid_Semantic_BM25-00D4FF?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Stack-NextJS_LangChain_MongoDB-success?style=for-the-badge" />
</p>

<p align="center">
  <a href="#-technical-architecture">Architecture</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-distributed-ingestion">Ingestion</a> •
  <a href="#-hybrid-search-engine">Hybrid Search</a> •
  <a href="#-ci-cd--devops">DevOps</a>
</p>

---

## 🏗️ Technical Architecture

Lamda is engineered to handle the "Heavy-Tail" problem in RAG—where document processing latency can degrade the user experience. By decoupling ingestion from the client-server loop, Lamda remains responsive even during massive document uploads.

### 🧩 System Design Breakdown

#### 1. The Gateway & Orchestration (Next.js & LangChain)
The application acts as a thin client for the UI but a heavy orchestrator for logic. It manages:
* **Dynamic Routing:** Toggling between direct LLM completion, Vector RAG, and Web-Search RAG.
* **Context Window Management:** Utilizing LangChain to summarize and prune retrieved context before injection.

#### 2. Asynchronous Ingestion (BullMQ & EC2)
Instead of processing documents in the API route (which leads to timeouts), Lamda utilizes a **Producer-Consumer pattern**:
* **Producer:** Next.js sends a signed URL for **AWS S3** and pushes a job to **BullMQ**.
* **Broker:** **Redis** manages the queue, providing persistence and retry logic.
* **Consumer:** A dedicated **EC2 Worker Node** runs a Node.js environment that performs recursive chunking, overlapping, and vector embedding generation (using `text-embedding-3-small` or `multilingual-e5`).

#### 3. Real-Time Web Intelligence (SearXNG)
To bridge the knowledge gap, Lamda integrates a self-hosted **SearXNG** instance on a separate EC2.
* **Meta-Engine:** It aggregates results from 70+ search engines.
* **Scraping Layer:** The engine extracts raw markdown content from the top-ranked URLs, allowing the LLM to "read" the web live without the cost of high-tier search APIs.

---

## 🛠️ Tech Stack

| Layer | Technology | Usage |
| :--- | :--- | :--- |
| **Frontend** | ![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=next.js&logoColor=white) ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white) | SSR, App Router, and utility-first styling for a responsive UI. |
| **Orchestration** | ![LangChain](https://img.shields.io/badge/LangChain-121212?style=flat&logo=chainlink&logoColor=white) | Complex chain management, document loaders, and prompt engineering. |
| **Asynchronous Processing** | ![BullMQ](https://img.shields.io/badge/BullMQ-FF4500?style=flat&logo=redis&logoColor=white) ![Redis](https://img.shields.io/badge/Redis-DC382D?style=flat&logo=redis&logoColor=white) | Distributed task queue to decouple heavy PDF/Docx processing. |
| **Database & Vector Store** | ![MongoDB Atlas](https://img.shields.io/badge/MongoDB_Atlas-47A248?style=flat&logo=mongodb&logoColor=white) | Persistent metadata storage and semantic vector search indexing. |
| **Object Storage** | ![AWS S3](https://img.shields.io/badge/AWS_S3-569A31?style=flat&logo=amazons3&logoColor=white) | Secure and scalable cloud storage for raw document files. |
| **Search Intelligence** | ![SearXNG](https://img.shields.io/badge/SearXNG-Live_Search-blue?style=flat) | Privacy-respecting meta-search engine for real-time web grounding. |
| **Deployment & DevOps** | ![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white) ![AWS EC2](https://img.shields.io/badge/AWS_EC2-FF9900?style=flat&logo=amazonec2&logoColor=white) | Containerized environment running on scalable cloud instances. |
| **CI/CD** | ![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=flat&logo=github-actions&logoColor=white) | Automated testing and deployment pipelines for zero-downtime updates. |

## ⚙️ The Data Flow

```mermaid
graph TD
    %% Frontend
    User((👤 User)) -->|Upload/Query| Next[Next.js Gateway]
    
    subgraph "Asynchronous Ingestion (Worker Layer)"
        Next -->|1. Store| S3[(AWS S3)]
        Next -->|2. Enqueue| Redis[BullMQ / Redis]
        Redis -->|3. Consume| EC2_W[EC2 Worker Instance]
        EC2_W -->|4. Chunk & Embed| Mongo[(MongoDB Atlas)]
    end
    
    subgraph "Intelligent Retrieval (Logic Layer)"
        Next -->|Hybrid Search| Mongo
        Next -->|Meta-Search| SXG[EC2 SearXNG]
        SXG -->|Scrape| Web((🌐 Open Web))
        
        Mongo -->|Semantic + BM25| LC[LangChain]
        Web -->|Real-time Data| LC
        LC -->|Synthesized Answer| Next
    end

    style EC2_W fill:#f96,stroke:#333,stroke-width:2px
    style SXG fill:#4ea,stroke:#333,stroke-width:2px
    style Next fill:#6E40C9,color:#fff
