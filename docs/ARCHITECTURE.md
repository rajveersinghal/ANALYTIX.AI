# System Architecture

## Overview

ANALYTIX.AI is a production-grade decision intelligence system built with a modular, layered architecture that separates concerns and enables scalability.

## Architecture Diagram

```mermaid
graph TB
    subgraph "Presentation Layer"
        UI[Streamlit UI]
    end
    
    subgraph "Application Layer"
        APP[app.py - Main Controller]
    end
    
    subgraph "Core Pipeline Layer"
        DL[Data Loader]
        CL[Cleaning]
        FE[Feature Engineering]
        MD[Modeling]
        DL --> CL
        CL --> FE
        FE --> MD
    end
    
    subgraph "Intelligence Layer"
        DASH[Dashboard]
        EXP[Experiment Tracker]
        REP[Report Generator]
        MON[Monitoring]
        DRIFT[Drift Detection]
    end
    
    subgraph "Configuration Layer"
        CONF[Settings]
        LOG[Logging Config]
    end
    
    subgraph "Data Layer"
        RAW[Raw Data]
        PROC[Processed Data]
        MODELS[Saved Models]
    end
    
    UI --> APP
    APP --> DL
    APP --> DASH
    APP --> EXP
    MD --> MODELS
    DL --> RAW
    FE --> PROC
    APP --> CONF
    CONF --> LOG
    
    style UI fill:#4f46e5
    style APP fill:#7c3aed
    style CONF fill:#10b981
    style MODELS fill:#f59e0b
```

## Layer Descriptions

### 1. Presentation Layer
- **Streamlit UI**: Interactive web interface
- Handles user interactions
- Displays visualizations and results
- Manages session state

### 2. Application Layer
- **app.py**: Main application controller
- Orchestrates workflow between layers
- Manages application state
- Handles routing and navigation

### 3. Core Pipeline Layer
Implements the ML pipeline:

- **Data Loader**: File ingestion and validation
- **Cleaning**: Missing value imputation, outlier handling
- **Feature Engineering**: Feature selection, encoding, scaling
- **Modeling**: Model training, hyperparameter tuning, evaluation

### 4. Intelligence Layer
Advanced analytics features:

- **Dashboard**: Interactive analytics dashboard
- **Experiment Tracker**: ML experiment logging
- **Report Generator**: Automated report creation
- **Monitoring**: Production monitoring and alerts
- **Drift Detection**: Data and model drift detection

### 5. Configuration Layer
- **Settings**: Centralized configuration
- **Logging Config**: Logging setup and management

### 6. Data Layer
- **Raw Data**: Original uploaded files
- **Processed Data**: Cleaned and transformed data
- **Saved Models**: Trained model artifacts

## Data Flow

```mermaid
sequenceDiagram
    participant User
    participant UI
    participant Core
    participant Intelligence
    participant Data
    
    User->>UI: Upload Dataset
    UI->>Core: Load Data
    Core->>Data: Save Raw Data
    Core->>Core: Clean & Transform
    Core->>Data: Save Processed Data
    Core->>Core: Train Models
    Core->>Data: Save Models
    Core->>Intelligence: Log Experiment
    Intelligence->>UI: Display Results
    UI->>User: Show Dashboard
```

## Module Dependencies

```mermaid
graph LR
    APP[app.py]
    
    subgraph Core
        DL[data_loader]
        CL[cleaning]
        FE[features]
        MD[modeling]
        UT[utils]
    end
    
    subgraph Intelligence
        DASH[dashboard]
        EXP[experiment_tracker]
        REP[report_generator]
    end
    
    subgraph Config
        SET[settings]
        LOG[logging_config]
    end
    
    APP --> DL
    APP --> CL
    APP --> FE
    APP --> MD
    APP --> DASH
    APP --> EXP
    APP --> REP
    
    DL --> UT
    CL --> UT
    FE --> UT
    MD --> UT
    
    APP --> SET
    UT --> LOG
```

## Design Patterns

### 1. Separation of Concerns
- Core logic separated from UI
- Configuration separated from code
- Tests separated from source

### 2. Dependency Injection
- Configuration injected via environment variables
- Paths managed centrally in settings

### 3. Factory Pattern
- Model creation based on problem type
- Feature engineering based on data type

### 4. Observer Pattern
- Experiment tracking observes model training
- Logging observes all operations

## Scalability Considerations

### Horizontal Scaling
- Stateless application design
- Session state managed by Streamlit
- Can deploy multiple instances behind load balancer

### Vertical Scaling
- Efficient memory management
- Lazy loading of large datasets
- Parallel processing where applicable

### Data Scaling
- Chunked processing for large files
- Incremental model training support
- Model persistence for reuse

## Security Architecture

### Input Validation
- File type validation
- Size limits on uploads
- Data type validation

### Data Protection
- Temporary file cleanup
- Secure model storage
- Environment variable protection

### Error Handling
- Graceful degradation
- Comprehensive logging
- User-friendly error messages

## Technology Stack

- **Frontend**: Streamlit
- **Backend**: Python 3.9+
- **ML Libraries**: scikit-learn, XGBoost, LightGBM
- **Data Processing**: pandas, numpy
- **Visualization**: plotly, matplotlib, seaborn
- **Containerization**: Docker
- **CI/CD**: GitHub Actions
- **Testing**: pytest
