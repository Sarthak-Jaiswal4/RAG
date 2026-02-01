Live Website - https://rag-xi-peach.vercel.app/

# <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Magnet.png" alt="Magnet" width="45" height="45" /> NexusRAG: Distributed Intelligence

> **Enterprise-Grade RAG Pipeline:** A high-performance, distributed Retrieval-Augmented Generation system leveraging asynchronous document processing, hybrid semantic search, and real-time web-meta-search.

<div align="center">
  <img src="https://capsule-render.vercel.app/render?type=soft&color=auto&height=250&section=header&text=NexusRAG&fontSize=90&animation=fadeIn&fontAlignY=38" width="100%" />
</div>

<p align="center">
  <img src="https://img.shields.io/badge/Architecture-Distributed_System-6E40C9?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Retrieval-Hybrid_Semantic_BM25-00D4FF?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Processing-Async_Worker_Nodes-success?style=for-the-badge" />
</p>

<p align="center">
  <a href="#-the-problem">Problem</a> •
  <a href="#-technical-architecture">Architecture</a> •
  <a href="#-deep-dive-retrieval">Retrieval Logic</a> •
  <a href="#-infrastructure">Infrastructure</a> •
  <a href="#-getting-started">Getting Started</a>
</p>

---

## 📖 The Vision
Most RAG applications fail when documents get large or queries require real-time context. **NexusRAG** solves this by decoupling document ingestion from the chat interface and bridging the gap between static documents and the live web.

* **Asynchronous Scaling:** Heavy PDF/Docx processing is handled by dedicated workers, keeping the UI snappy.
* **Contextual Accuracy:** Combines the "meaning" of Semantic Search with the "precision" of BM25.
* **Live-Web Grounding:** Uses an isolated SearXNG instance to prevent hallucination on current events.

---

## 🏗️ Technical Architecture

The system is split into three core layers: **The Gateway**, **The Brain**, and **The Worker**.

### 1. The Gateway (Next.js & LangChain)
The frontend serves as the orchestration layer. It manages user sessions, toggles between "Direct LLM" and "RAG Mode," and streams responses in real-time.

### 2. Distributed Ingestion Pipeline
When a user uploads a `.pdf` or `.docx`:
1.  **S3 Persistence:** The file is immediately streamed to **AWS S3**.
2.  **BullMQ Messaging:** A job is created in **Redis**. This ensures that even if the server restarts, no document is lost.
3.  **EC2 Worker:** A standalone Node.js worker pulls the job, performs **Recursive Character Text Splitting**, and generates 1536-dimensional embeddings.
4.  **Vector Persistence:** Data is indexed in **MongoDB Atlas Vector Search**.

### 3. Real-time Search Meta-Engine
For "Web Mode," the system queries an **EC2-hosted SearXNG** instance. Unlike Google Search APIs, SearXNG aggregates results from 70+ sources while maintaining privacy and providing raw markdown for better LLM scraping.

---

## ⚙️ System Flow

```mermaid
graph TD
    %% User Interaction
    U[👤 User] -->|Query/Upload| FE[Next.js App]
    
    %% Ingestion Path
    subgraph "Asynchronous Ingestion Layer"
        FE -->|Upload| S3[(AWS S3 Bucket)]
        FE -->|Enqueue| BMQ[BullMQ / Redis]
        BMQ -->|Job| WRK[EC2 Worker Instance]
        WRK -->|Embeddings| MDB[(MongoDB Vector Store)]
    end
    
    %% Retrieval Path
    subgraph "Hybrid Intelligence Layer"
        FE -->|Hybrid Query| MDB
        FE -->|Scrape| SXG[EC2 SearXNG Instance]
        SXG -->|Meta-Search| WEB((🌐 Live Web))
        MDB -->|Context| LC[LangChain Orchestrator]
        WEB -->|Context| LC
        LC -->|Final Answer| FE
    end

    style WRK fill:#f96,stroke:#333,stroke-width:2px
    style SXG fill:#4ea,stroke:#333,stroke-width:2px
    style FE fill:#6E40C9,color:#fff
