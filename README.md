# DevConnect 🚀

**DevConnect** is a graph-native developer discovery and collaboration platform that helps developers explore profiles, repositories, technologies, contributions, pull requests, issues, and collaboration relationships through an interactive graph-based experience.

The platform uses graph concepts to answer practical developer-network questions such as finding relevant repositories, suggesting reviewers, discovering developer connections, and finding the shortest collaboration path between two developers.

## 🌐 Live Demo

**Live Application:**
https://dev-connect-seven-zeta.vercel.app/


**GitHub Repository:**
https://github.com/khyathi-2006/DevConnect

## ✨ Features

### 🔎 Developer & Repository Search

Search for developers and repositories from the DevConnect dashboard and quickly explore their relationships within the developer graph.

### 👨‍💻 Developer Profiles

Developer profile pages provide information about:

* Developer skills and technologies
* Contribution history
* Connected developers
* Pull-request activity
* Repository recommendations
* Collaboration relationships

### 📦 Repository Exploration

Repository pages provide graph-based information about:

* Contributors
* Technologies used
* Issues
* Pull requests
* Potential reviewers
* Developer relationships

### 🤝 Reviewer Recommendations

DevConnect analyzes developer and repository relationships to suggest suitable reviewers based on contribution and collaboration connections.

### 🛣️ Shortest Collaboration Path

The **Find a Path** feature discovers the shortest connection between two developers.

The traversal considers relationships such as:

* Direct developer connections
* Shared repositories
* Pull-request reviews
* Contribution relationships

This allows users to understand how two developers are connected within the collaboration graph.

### 🕸️ Graph-Based Data Model

The application represents developers, repositories, technologies, pull requests, and issues as interconnected graph entities.

Core relationships include:

```text
Developer
   ├── CONTRIBUTED_TO → Repository
   ├── SKILLED_IN → Technology
   └── KNOWS → Developer

Repository
   └── USES → Technology

Pull Request
   ├── AUTHORED_BY → Developer
   └── REVIEWED_BY → Developer
```

## 🧠 Graph Queries

DevConnect is designed around four major graph-based questions:

1. **Developer Discovery**
   Find information about developers and their contribution networks.

2. **Repository Recommendations**
   Recommend repositories based on developer skills and technology relationships.

3. **Reviewer Suggestions**
   Identify developers who may be suitable reviewers for a repository or pull request.

4. **Shortest Collaboration Path**
   Find the shortest relationship path between two developers.

## 🗃️ Dataset

The project includes a deterministic seed dataset containing:

* **8 Developers**
* **6 Repositories**
* **10 Technologies**
* **8 Pull Requests**
* **8 Issues**
* Supporting graph relationships

The bundled dataset allows the application to run and demonstrate the graph functionality without requiring an external database connection.

## 🛠️ Tech Stack

| Technology          | Purpose                                 |
| ------------------- | --------------------------------------- |
| **TanStack Start**  | Full-stack application framework        |
| **TanStack Router** | Application routing                     |
| **React 19**        | Frontend UI                             |
| **TypeScript**      | Type-safe development                   |
| **Tailwind CSS 4**  | Styling and responsive UI               |
| **Zod**             | Validation for server functions         |
| **CognoDB**         | Graph database                          |
| **Bolt / Cypher**   | Graph database connectivity and queries |
| **Vercel**          | Deployment                              |
| **GitHub**          | Version control and source code hosting |

## 📁 Project Structure

```text
DevConnect/
│
├── public/
│
├── seed/
│   └── Graph seed data and database setup
│
├── src/
│   ├── components/
│   │   └── Reusable UI components
│   │
│   ├── lib/
│   │   └── DevConnect graph schema and application logic
│   │
│   └── routes/
│       ├── index
│       │   └── Dashboard and search
│       │
│       ├── developers/
│       │   └── Developer profiles
│       │
│       ├── repositories/
│       │   └── Repository details
│       │
│       └── path/
│           └── Shortest collaboration path
│
├── .env.example
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 🚀 Getting Started

### Prerequisites

Make sure the following are installed:

* Node.js
* npm
* Git

### Clone the Repository

```bash
git clone https://github.com/khyathi-2006/DevConnect.git
```

Move into the project directory:

```bash
cd DevConnect
```

### Install Dependencies

```bash
npm install
```

### Run the Development Server

```bash
npm run dev
```

Open the local URL provided by Vite, typically:

```text
http://localhost:3000/
```

The dashboard can also be accessed using:

```text
http://localhost:3000/?q=
```

## 🗄️ CognoDB Configuration

DevConnect can work with the bundled dataset without database credentials.

For a CognoDB instance, create a `.env` file based on `.env.example`:

```env
COGNODB_URI=bolt+s://your-instance.databases.cognodb.cloud
COGNODB_USERNAME=cognodb
COGNODB_PASSWORD=your-password
```

Then run:

```bash
npm run seed
```

The seed process creates the deterministic DevConnect graph dataset in the configured database.

## 📊 Application Routes

| Route                   | Description                                    |
| ----------------------- | ---------------------------------------------- |
| `/`                     | Main dashboard and developer/repository search |
| `/developers/:username` | Developer profile and recommendations          |
| `/repositories/:id`     | Repository details and reviewer matching       |
| `/path`                 | Find the shortest collaboration path           |

## 🔗 Important Links

**Dashboard:**
https://dev-connect-seven-zeta.vercel.app/

**Find Collaboration Path:**
https://dev-connect-seven-zeta.vercel.app/path

**Source Code:**
https://github.com/khyathi-2006/DevConnect

## 📜 Available Scripts

Run the development server:

```bash
npm run dev
```

Build the application:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

Run linting:

```bash
npm run lint
```

Format the project:

```bash
npm run format
```

Seed the graph database:

```bash
npm run seed
```

## 🔄 How DevConnect Works

```text
                 ┌──────────────────┐
                 │     Developer    │
                 └────────┬─────────┘
                          │
              ┌───────────┼───────────┐
              │           │           │
              ▼           ▼           ▼
          Repository  Technology   Developer
              │                       │
              ▼                       ▼
        Pull Requests              KNOWS
              │
              ▼
           Reviewer
```

A user begins by searching for a developer or repository. DevConnect then traverses the underlying graph relationships to retrieve connected entities and recommendations.

For collaboration-path queries, the application traverses developer relationships, shared contributions, and review relationships to determine a shortest path between the selected developers.

## 🎯 Project Objective

The main objective of DevConnect is to demonstrate how graph-based data modeling can be applied to developer collaboration and discovery.

Traditional applications often retrieve information using independent tables or collections. DevConnect instead represents developers and their activities as connected entities, making relationship-based queries such as collaboration paths and reviewer recommendations more natural.

## 💡 Key Highlights

* Graph-native developer discovery
* Relationship-based repository recommendations
* Developer collaboration mapping
* Shortest-path traversal
* Reviewer recommendation
* Deterministic seed dataset
* Responsive web interface
* Type-safe TypeScript implementation
* Modern React-based architecture
* Production deployment using Vercel

## 🚀 Future Enhancements

Future versions of DevConnect could include real GitHub API integration, live repository synchronization, authentication, personalized developer recommendations, advanced graph visualizations, real-time collaboration analytics, and larger datasets.

## 👩‍💻 Author

**Khyathi**

B.Tech Computer Science and Engineering
VIT-AP University

### Project

**DevConnect — Graph-Native Developer Collaboration Platform**

---

⭐ If you find this project useful, consider giving the repository a star on GitHub.
