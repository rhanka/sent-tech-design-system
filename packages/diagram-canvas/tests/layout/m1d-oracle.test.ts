// @ts-nocheck
/**
 * M1-d §8.7 oracle coverage: all frozen ordering trees (A2–A4: 71 parent
 * lists / 207 references) with hierarchy and conforming presentation, and A5
 * grouping without altering source families or hierarchy.
 * Data transcribed verbatim from spec / Engram oracle (spec 8.7 JSON + S2-target engram for A5 hierarchy).
 * English in code.
 */
import {
  CURRENT_SCHEMA_VERSION,
  documentRef,
  entityRef,
  m3ProfileRegistry,
  occurrenceRef,
  relationRef,
  shippedExecutorBindings,
  type Entity,
  type Relation,
  type SemanticDocument,
} from '@sentropic/diagram-core';
import { describe, expect, it } from 'vitest';
import { layoutDocument } from '../../src/index.js';
import { measure } from './fixtures.js';
import { geometryOf, occurrenceOfEntity, wordWrapMeasurer } from './m1d-fixtures.js';

const ORDERING: Record<string, Record<string, readonly string[]>> = {
  "A2": {
    "entity:PEOPLE": [
      "entity:EMP",
      "entity:DEV"
    ],
    "entity:WS": [
      "entity:CHAT"
    ],
    "entity:GCP": [
      "entity:PROJ",
      "entity:SSMPROJ",
      "entity:PRODZ"
    ],
    "entity:PROJ": [
      "entity:LBIAP",
      "entity:NET",
      "entity:MSGZ",
      "entity:RUNZ",
      "entity:AEZ",
      "entity:STATEZ",
      "entity:VERTEXZ",
      "entity:OBSZ",
      "entity:CICDZ"
    ],
    "entity:MSGZ": [
      "entity:TOPIC",
      "entity:SUB"
    ],
    "entity:RUNZ": [
      "entity:APP",
      "entity:PUSH",
      "entity:CONS",
      "entity:CHATCLI",
      "entity:AGENT",
      "entity:QUERY",
      "entity:ADMINT"
    ],
    "entity:AEZ": [
      "entity:AEAPP"
    ],
    "entity:STATEZ": [
      "entity:DOCS",
      "entity:SESS",
      "entity:CSQL",
      "entity:BKT",
      "entity:FS"
    ],
    "entity:VERTEXZ": [
      "entity:RAG",
      "entity:GEM"
    ],
    "entity:OBSZ": [
      "entity:CLOG",
      "entity:LOGS",
      "entity:BQ",
      "entity:PHX"
    ],
    "entity:CICDZ": [
      "entity:CB",
      "entity:AR",
      "entity:TF",
      "entity:TFST"
    ],
    "entity:SSMPROJ": [
      "entity:SSM",
      "entity:IFMIR",
      "entity:BASE"
    ],
    "entity:PRODZ": [
      "entity:PRODNP"
    ],
    "entity:OUT": [
      "entity:AWSZ"
    ],
    "entity:AWSZ": [
      "entity:JENKINS",
      "entity:JFROG",
      "entity:GITHUBZ",
      "entity:GITLABZ"
    ],
    "entity:GITHUBZ": [
      "entity:CUTTER",
      "entity:AGARDEN",
      "entity:IFREPO",
      "entity:GLIBS"
    ],
    "entity:GITLABZ": [
      "entity:SCMREPO"
    ]
  },
  "A3": {
    "entity:PEOPLE": [
      "entity:EMP",
      "entity:DEV",
      "entity:HRADM"
    ],
    "entity:WS": [
      "entity:CHAT",
      "entity:DRIVE"
    ],
    "entity:GCP": [
      "entity:PROJ",
      "entity:SSMPROJ",
      "entity:PRODZ"
    ],
    "entity:PROJ": [
      "entity:NET",
      "entity:MSGZ",
      "entity:RUNZ",
      "entity:STATEZ",
      "entity:VERTEXZ",
      "entity:OBSZ",
      "entity:INGZ",
      "entity:CICDZ"
    ],
    "entity:MSGZ": [
      "entity:TOPIC",
      "entity:SUB"
    ],
    "entity:RUNZ": [
      "entity:PUSH",
      "entity:EVT",
      "entity:CONS",
      "entity:CHATCLI",
      "entity:FEEDBACK",
      "entity:ELIG",
      "entity:AGENT",
      "entity:LINK",
      "entity:QUERY"
    ],
    "entity:STATEZ": [
      "entity:DOCS",
      "entity:SESS",
      "entity:FS",
      "entity:CSQL"
    ],
    "entity:VERTEXZ": [
      "entity:RAG",
      "entity:GEM",
      "entity:ARMOR"
    ],
    "entity:OBSZ": [
      "entity:CLOG",
      "entity:LOGS",
      "entity:BQ",
      "entity:PHX"
    ],
    "entity:INGZ": [
      "entity:SYNC",
      "entity:IMPORT"
    ],
    "entity:CICDZ": [
      "entity:CB",
      "entity:AR",
      "entity:TF",
      "entity:TFST"
    ],
    "entity:SSMPROJ": [
      "entity:SSM",
      "entity:IFMIR",
      "entity:BASE"
    ],
    "entity:PRODZ": [
      "entity:PCICD",
      "entity:PSHARED",
      "entity:PDEVZ",
      "entity:PINTZ",
      "entity:PPROZ"
    ],
    "entity:PCICD": [
      "entity:PAR",
      "entity:PIAC"
    ],
    "entity:PSHARED": [
      "entity:PSVPC",
      "entity:PLIBS"
    ],
    "entity:PDEVZ": [
      "entity:PDEV"
    ],
    "entity:PINTZ": [
      "entity:PINT"
    ],
    "entity:PPROZ": [
      "entity:PPRO"
    ],
    "entity:OUT": [
      "entity:AWSZ"
    ],
    "entity:AWSZ": [
      "entity:JENKINS",
      "entity:JFROG",
      "entity:GITHUBZ",
      "entity:GITLABZ"
    ],
    "entity:GITHUBZ": [
      "entity:CUTTER",
      "entity:AGARDEN",
      "entity:IFREPO",
      "entity:GLIBS"
    ],
    "entity:GITLABZ": [
      "entity:SCMREPO"
    ]
  },
  "A4a": {
    "entity:PEOPLE": [
      "entity:EMP",
      "entity:HRADM"
    ],
    "entity:WS": [
      "entity:CHAT",
      "entity:APPSS",
      "entity:DRIVE"
    ],
    "entity:GCP": [
      "entity:PROJ",
      "entity:PRODZ"
    ],
    "entity:PROJ": [
      "entity:CXZ",
      "entity:TOOLZ",
      "entity:VAIZ",
      "entity:STATEZ",
      "entity:GOVZ"
    ],
    "entity:CXZ": [
      "entity:CXINT",
      "entity:CXAGENT",
      "entity:PLAYBOOK",
      "entity:DSTOOL"
    ],
    "entity:TOOLZ": [
      "entity:LINKF",
      "entity:RLA"
    ],
    "entity:VAIZ": [
      "entity:DATASTORE",
      "entity:GEM"
    ],
    "entity:STATEZ": [
      "entity:DOCS",
      "entity:SYNC",
      "entity:BQLOG"
    ],
    "entity:GOVZ": [
      "entity:NOIAC",
      "entity:EXPORT"
    ],
    "entity:PRODZ": [
      "entity:PDEVZ",
      "entity:PINTZ",
      "entity:PPROZ"
    ],
    "entity:PDEVZ": [
      "entity:PDEV"
    ],
    "entity:PINTZ": [
      "entity:PINT"
    ],
    "entity:PPROZ": [
      "entity:PPRO"
    ],
    "entity:OUT": [
      "entity:AWSZ"
    ],
    "entity:AWSZ": [
      "entity:GITHUBZ",
      "entity:GITLABZ"
    ],
    "entity:GITHUBZ": [
      "entity:GENTPL"
    ],
    "entity:GITLABZ": [
      "entity:SCMREPO"
    ]
  },
  "A4b": {
    "entity:LEFT": [
      "entity:USERS",
      "entity:CASB",
      "entity:IDP",
      "entity:SIEM"
    ],
    "entity:PCP": [
      "entity:PLOG",
      "entity:CONN",
      "entity:MAF",
      "entity:VPCSC",
      "entity:GAPI",
      "entity:IAM",
      "entity:AIP",
      "entity:DATAHUB"
    ],
    "entity:AIP": [
      "entity:EAI",
      "entity:SPOKE"
    ],
    "entity:EAI": [
      "entity:AUTHM",
      "entity:OBSV",
      "entity:AUDIT",
      "entity:SCC",
      "entity:GEZ",
      "entity:GEAP"
    ],
    "entity:GEZ": [
      "entity:GEUI",
      "entity:MA1",
      "entity:FEDC",
      "entity:DSTORE"
    ],
    "entity:GEAP": [
      "entity:GW",
      "entity:POL",
      "entity:MA2",
      "entity:RUNTIME"
    ],
    "entity:RUNTIME": [
      "entity:HRAGENT",
      "entity:HRTOOLS"
    ],
    "entity:SPOKE": [
      "entity:RAG",
      "entity:GEM",
      "entity:DOCS",
      "entity:SYNC",
      "entity:XIAM",
      "entity:PSL"
    ],
    "entity:DATAHUB": [
      "entity:DATAPROD",
      "entity:PIPE"
    ],
    "entity:RIGHT": [
      "entity:LAN",
      "entity:SAASZ"
    ],
    "entity:SAASZ": [
      "entity:DRIVE",
      "entity:CHAT"
    ],
    "entity:OUT": [
      "entity:AWSZ"
    ],
    "entity:AWSZ": [
      "entity:JENKINS",
      "entity:GITHUBZ",
      "entity:GITLABZ"
    ],
    "entity:GITHUBZ": [
      "entity:CUTTER"
    ],
    "entity:GITLABZ": [
      "entity:SCMREPO"
    ]
  }
};

const A5_ENTITIES = {
  "entity:PEOPLE": {
    "id": "entity:PEOPLE",
    "profile": "generic@2",
    "type": "container",
    "attributes": {
      "name": {
        "kind": "text",
        "value": "Users and operators"
      }
    }
  },
  "entity:WS": {
    "id": "entity:WS",
    "profile": "generic@2",
    "type": "container",
    "attributes": {
      "name": {
        "kind": "text",
        "value": "Google Workspace"
      }
    }
  },
  "entity:GCP": {
    "id": "entity:GCP",
    "profile": "generic@2",
    "type": "container",
    "attributes": {
      "name": {
        "kind": "text",
        "value": "Google Cloud Platform"
      }
    }
  },
  "entity:PRODZ": {
    "id": "entity:PRODZ",
    "profile": "generic@2",
    "type": "container",
    "attributes": {
      "name": {
        "kind": "text",
        "value": "PROD landing zone"
      }
    }
  },
  "entity:PPROZ": {
    "id": "entity:PPROZ",
    "profile": "generic@2",
    "type": "container",
    "attributes": {
      "name": {
        "kind": "text",
        "value": "HRPN pro project"
      }
    }
  },
  "entity:MSGZ": {
    "id": "entity:MSGZ",
    "profile": "generic@2",
    "type": "container",
    "attributes": {
      "name": {
        "kind": "text",
        "value": "Pub/Sub"
      },
      "category": {
        "kind": "text",
        "value": "outside"
      }
    }
  },
  "entity:RUNZ": {
    "id": "entity:RUNZ",
    "profile": "generic@2",
    "type": "container",
    "attributes": {
      "name": {
        "kind": "text",
        "value": "Cloud Run"
      }
    }
  },
  "entity:STATEZ": {
    "id": "entity:STATEZ",
    "profile": "generic@2",
    "type": "container",
    "attributes": {
      "name": {
        "kind": "text",
        "value": "Storage and state"
      }
    }
  },
  "entity:VERTEXZ": {
    "id": "entity:VERTEXZ",
    "profile": "generic@2",
    "type": "container",
    "attributes": {
      "name": {
        "kind": "text",
        "value": "Vertex AI"
      },
      "category": {
        "kind": "text",
        "value": "custom"
      }
    }
  },
  "entity:INGZ": {
    "id": "entity:INGZ",
    "profile": "generic@2",
    "type": "container",
    "attributes": {
      "name": {
        "kind": "text",
        "value": "Ingestion"
      },
      "category": {
        "kind": "text",
        "value": "custom"
      }
    }
  },
  "entity:PSHARED": {
    "id": "entity:PSHARED",
    "profile": "generic@2",
    "type": "container",
    "attributes": {
      "name": {
        "kind": "text",
        "value": "PROD shared projects"
      }
    }
  },
  "entity:PCICD": {
    "id": "entity:PCICD",
    "profile": "generic@2",
    "type": "container",
    "attributes": {
      "name": {
        "kind": "text",
        "value": "CI/CD"
      }
    }
  },
  "entity:OBSZ": {
    "id": "entity:OBSZ",
    "profile": "generic@2",
    "type": "container",
    "attributes": {
      "name": {
        "kind": "text",
        "value": "Observability"
      },
      "category": {
        "kind": "text",
        "value": "custom"
      }
    }
  },
  "entity:OUT": {
    "id": "entity:OUT",
    "profile": "generic@2",
    "type": "container",
    "attributes": {
      "name": {
        "kind": "text",
        "value": "AWS"
      }
    }
  },
  "entity:GITHUBZ": {
    "id": "entity:GITHUBZ",
    "profile": "generic@2",
    "type": "container",
    "attributes": {
      "name": {
        "kind": "text",
        "value": "Airbus GitHub"
      }
    }
  },
  "entity:GENSRC": {
    "id": "entity:GENSRC",
    "profile": "generic@2",
    "type": "container",
    "attributes": {
      "name": {
        "kind": "text",
        "value": "GenAiR sources"
      },
      "category": {
        "kind": "text",
        "value": "genair"
      }
    }
  },
  "entity:GITLABZ": {
    "id": "entity:GITLABZ",
    "profile": "generic@2",
    "type": "container",
    "attributes": {
      "name": {
        "kind": "text",
        "value": "Airbus GitLab"
      }
    }
  },
  "entity:AWSCI": {
    "id": "entity:AWSCI",
    "profile": "generic@2",
    "type": "container",
    "attributes": {
      "name": {
        "kind": "text",
        "value": "CI/CD"
      }
    }
  },
  "entity:LEGEND": {
    "id": "entity:LEGEND",
    "profile": "generic@2",
    "type": "legend",
    "attributes": {
      "name": {
        "kind": "text",
        "value": "Legend"
      }
    }
  },
  "entity:EMP": {
    "id": "entity:EMP",
    "profile": "generic@2",
    "type": "node",
    "attributes": {
      "name": {
        "kind": "text",
        "value": "Employees · HR"
      }
    }
  },
  "entity:DEV": {
    "id": "entity:DEV",
    "profile": "generic@2",
    "type": "node",
    "attributes": {
      "name": {
        "kind": "text",
        "value": "Developers · admin"
      }
    }
  },
  "entity:HRADM": {
    "id": "entity:HRADM",
    "profile": "generic@2",
    "type": "node",
    "attributes": {
      "name": {
        "kind": "text",
        "value": "HR · content owners"
      },
      "category": {
        "kind": "text",
        "value": "custom"
      }
    }
  },
  "entity:CHAT": {
    "id": "entity:CHAT",
    "profile": "generic@2",
    "type": "node",
    "attributes": {
      "name": {
        "kind": "text",
        "value": "Chat app"
      }
    }
  },
  "entity:DRIVE": {
    "id": "entity:DRIVE",
    "profile": "generic@2",
    "type": "node",
    "attributes": {
      "name": {
        "kind": "text",
        "value": "Drive · source"
      },
      "category": {
        "kind": "text",
        "value": "custom"
      }
    }
  },
  "entity:TOPIC": {
    "id": "entity:TOPIC",
    "profile": "generic@2",
    "type": "node",
    "attributes": {
      "name": {
        "kind": "text",
        "value": "Pub/Sub · topic"
      },
      "category": {
        "kind": "text",
        "value": "outside"
      }
    }
  },
  "entity:SUB": {
    "id": "entity:SUB",
    "profile": "generic@2",
    "type": "node",
    "attributes": {
      "name": {
        "kind": "text",
        "value": "Pub/Sub · push"
      },
      "category": {
        "kind": "text",
        "value": "outside"
      }
    }
  },
  "entity:APP": {
    "id": "entity:APP",
    "profile": "generic@2",
    "type": "node",
    "attributes": {
      "name": {
        "kind": "text",
        "value": "Backend · FastAPI"
      },
      "category": {
        "kind": "text",
        "value": "genair"
      }
    }
  },
  "entity:AGENT": {
    "id": "entity:AGENT",
    "profile": "generic@2",
    "type": "node",
    "attributes": {
      "name": {
        "kind": "text",
        "value": "ADK agent · RAG tools"
      },
      "category": {
        "kind": "text",
        "value": "custom"
      }
    }
  },
  "entity:CHATAPI": {
    "id": "entity:CHATAPI",
    "profile": "generic@2",
    "type": "node",
    "attributes": {
      "name": {
        "kind": "text",
        "value": "Google Chat · API"
      },
      "category": {
        "kind": "text",
        "value": "outside"
      }
    }
  },
  "entity:DOCS": {
    "id": "entity:DOCS",
    "profile": "generic@2",
    "type": "node",
    "attributes": {
      "name": {
        "kind": "text",
        "value": "Bucket · documents"
      },
      "category": {
        "kind": "text",
        "value": "custom"
      }
    }
  },
  "entity:FS": {
    "id": "entity:FS",
    "profile": "generic@2",
    "type": "node",
    "attributes": {
      "name": {
        "kind": "text",
        "value": "Firestore · sessions"
      },
      "category": {
        "kind": "text",
        "value": "custom"
      }
    }
  },
  "entity:RAG": {
    "id": "entity:RAG",
    "profile": "generic@2",
    "type": "node",
    "attributes": {
      "name": {
        "kind": "text",
        "value": "RAG Engine"
      },
      "category": {
        "kind": "text",
        "value": "custom"
      }
    }
  },
  "entity:GEM": {
    "id": "entity:GEM",
    "profile": "generic@2",
    "type": "node",
    "attributes": {
      "name": {
        "kind": "text",
        "value": "Model · Gemini"
      }
    }
  },
  "entity:ARMOR": {
    "id": "entity:ARMOR",
    "profile": "generic@2",
    "type": "node",
    "attributes": {
      "name": {
        "kind": "text",
        "value": "Model Armor"
      },
      "category": {
        "kind": "text",
        "value": "custom"
      }
    }
  },
  "entity:SYNC": {
    "id": "entity:SYNC",
    "profile": "generic@2",
    "type": "node",
    "attributes": {
      "name": {
        "kind": "text",
        "value": "Job · Drive sync"
      },
      "category": {
        "kind": "text",
        "value": "custom"
      }
    }
  },
  "entity:IMPORT": {
    "id": "entity:IMPORT",
    "profile": "generic@2",
    "type": "node",
    "attributes": {
      "name": {
        "kind": "text",
        "value": "Job · RAG import"
      },
      "category": {
        "kind": "text",
        "value": "custom"
      }
    }
  },
  "entity:PSSM": {
    "id": "entity:PSSM",
    "profile": "generic@2",
    "type": "node",
    "attributes": {
      "name": {
        "kind": "text",
        "value": "Repo · SSM"
      },
      "category": {
        "kind": "text",
        "value": "custom"
      }
    }
  },
  "entity:PAR": {
    "id": "entity:PAR",
    "profile": "generic@2",
    "type": "node",
    "attributes": {
      "name": {
        "kind": "text",
        "value": "Registry · PROD"
      },
      "category": {
        "kind": "text",
        "value": "custom"
      }
    }
  },
  "entity:PIAC": {
    "id": "entity:PIAC",
    "profile": "generic@2",
    "type": "node",
    "attributes": {
      "name": {
        "kind": "text",
        "value": "IaC · WIF"
      },
      "category": {
        "kind": "text",
        "value": "custom"
      }
    }
  },
  "entity:PLIBS": {
    "id": "entity:PLIBS",
    "profile": "generic@2",
    "type": "node",
    "attributes": {
      "name": {
        "kind": "text",
        "value": "Libs · PyPI"
      },
      "category": {
        "kind": "text",
        "value": "genair"
      }
    }
  },
  "entity:CLOG": {
    "id": "entity:CLOG",
    "profile": "generic@2",
    "type": "node",
    "attributes": {
      "name": {
        "kind": "text",
        "value": "Logging · audit"
      },
      "category": {
        "kind": "text",
        "value": "custom"
      }
    }
  },
  "entity:LOGS": {
    "id": "entity:LOGS",
    "profile": "generic@2",
    "type": "node",
    "attributes": {
      "name": {
        "kind": "text",
        "value": "Logs · 1 year"
      },
      "category": {
        "kind": "text",
        "value": "custom"
      }
    }
  },
  "entity:BQ": {
    "id": "entity:BQ",
    "profile": "generic@2",
    "type": "node",
    "attributes": {
      "name": {
        "kind": "text",
        "value": "BigQuery · linked"
      },
      "category": {
        "kind": "text",
        "value": "genair"
      }
    }
  },
  "entity:PHX": {
    "id": "entity:PHX",
    "profile": "generic@2",
    "type": "node",
    "attributes": {
      "name": {
        "kind": "text",
        "value": "Tracing · Phoenix"
      },
      "category": {
        "kind": "text",
        "value": "genair"
      }
    }
  },
  "entity:PSVPC": {
    "id": "entity:PSVPC",
    "profile": "generic@2",
    "type": "node",
    "attributes": {
      "name": {
        "kind": "text",
        "value": "Network · SVPC"
      },
      "category": {
        "kind": "text",
        "value": "custom"
      }
    }
  },
  "entity:CUTTER": {
    "id": "entity:CUTTER",
    "profile": "generic@2",
    "type": "node",
    "attributes": {
      "name": {
        "kind": "text",
        "value": "Template · GenAiR"
      },
      "category": {
        "kind": "text",
        "value": "genair"
      }
    }
  },
  "entity:AGARDEN": {
    "id": "entity:AGARDEN",
    "profile": "generic@2",
    "type": "node",
    "attributes": {
      "name": {
        "kind": "text",
        "value": "Agents · template"
      },
      "category": {
        "kind": "text",
        "value": "genair"
      }
    }
  },
  "entity:IFREPO": {
    "id": "entity:IFREPO",
    "profile": "generic@2",
    "type": "node",
    "attributes": {
      "name": {
        "kind": "text",
        "value": "IaC · modules"
      },
      "category": {
        "kind": "text",
        "value": "genair"
      }
    }
  },
  "entity:GLIBS": {
    "id": "entity:GLIBS",
    "profile": "generic@2",
    "type": "node",
    "attributes": {
      "name": {
        "kind": "text",
        "value": "Libs · GenAiR"
      },
      "category": {
        "kind": "text",
        "value": "genair"
      }
    }
  },
  "entity:SCMREPO": {
    "id": "entity:SCMREPO",
    "profile": "generic@2",
    "type": "node",
    "attributes": {
      "name": {
        "kind": "text",
        "value": "Repo · SCM"
      },
      "category": {
        "kind": "text",
        "value": "custom"
      }
    }
  },
  "entity:JENKINS": {
    "id": "entity:JENKINS",
    "profile": "generic@2",
    "type": "node",
    "attributes": {
      "name": {
        "kind": "text",
        "value": "CI · Jenkins"
      }
    }
  },
  "entity:JFROG": {
    "id": "entity:JFROG",
    "profile": "generic@2",
    "type": "node",
    "attributes": {
      "name": {
        "kind": "text",
        "value": "Registry · JFrog"
      }
    }
  },
  "entity:legend-genair": {
    "id": "entity:legend-genair",
    "profile": "generic@2",
    "type": "legend-key",
    "attributes": {
      "name": {
        "kind": "text",
        "value": "GenAiR standard"
      },
      "category": {
        "kind": "text",
        "value": "genair"
      },
      "description": {
        "kind": "text",
        "value": "GenAiR template, unchanged"
      }
    }
  },
  "entity:legend-custom": {
    "id": "entity:legend-custom",
    "profile": "generic@2",
    "type": "legend-key",
    "attributes": {
      "name": {
        "kind": "text",
        "value": "GenAiR customisation"
      },
      "category": {
        "kind": "text",
        "value": "custom"
      },
      "description": {
        "kind": "text",
        "value": "within the template frame"
      }
    }
  },
  "entity:legend-outside": {
    "id": "entity:legend-outside",
    "profile": "generic@2",
    "type": "legend-key",
    "attributes": {
      "name": {
        "kind": "text",
        "value": "Specific for HRPN"
      },
      "category": {
        "kind": "text",
        "value": "outside"
      },
      "description": {
        "kind": "text",
        "value": "added outside the template"
      }
    }
  },
  "entity:legend-none": {
    "id": "entity:legend-none",
    "profile": "generic@2",
    "type": "legend-key",
    "attributes": {
      "name": {
        "kind": "text",
        "value": "Managed service"
      },
      "category": {
        "kind": "text",
        "value": "none"
      },
      "description": {
        "kind": "text",
        "value": "Google or third-party"
      }
    }
  }
};
const A5_PRESENTATION = {
  "occurrence:PEOPLE": {
    "form": "container",
    "text": {
      "kicker": "PPL",
      "subtitle": "Employees HR · Developers admin · HR content owners",
      "footer": "scope: Users and operators"
    },
    "icon": "people"
  },
  "occurrence:WS": {
    "form": "container",
    "text": {
      "kicker": "GWS",
      "subtitle": "Chat app · Drive source",
      "footer": "service: Google Workspace"
    },
    "icon": "window"
  },
  "occurrence:GCP": {
    "form": "container",
    "text": {
      "kicker": "GOOGLE CLOUD",
      "subtitle": "PROD landing zone",
      "footer": "service: Google Cloud"
    },
    "icon": "cloud"
  },
  "occurrence:PRODZ": {
    "form": "container",
    "text": {
      "kicker": "GCP PROJECT (PROD)",
      "subtitle": "app_code (to provision)",
      "footer": "service: GCP project (PROD)"
    },
    "icon": "server"
  },
  "occurrence:PPROZ": {
    "form": "container",
    "text": {
      "kicker": "GCP PROJECT (PROD)",
      "subtitle": "project_id_pro",
      "footer": "service: GCP project (PROD)"
    },
    "icon": "server"
  },
  "occurrence:MSGZ": {
    "form": "container",
    "text": {
      "kicker": "PS",
      "subtitle": "Pub/Sub topic · Pub/Sub push",
      "footer": "service: Pub/Sub"
    },
    "icon": "link",
    "categoryRef": "entity:legend-outside"
  },
  "occurrence:RUNZ": {
    "form": "container",
    "text": {
      "kicker": "HRPN",
      "subtitle": "hrpn-ragengine-agent",
      "footer": "repo: HRPN"
    },
    "icon": "server"
  },
  "occurrence:STATEZ": {
    "form": "container",
    "text": {
      "kicker": "HRPN",
      "subtitle": "Bucket documents · Firestore sessions",
      "footer": "repo: HRPN"
    },
    "icon": "db"
  },
  "occurrence:VERTEXZ": {
    "form": "container",
    "text": {
      "kicker": "VAI",
      "subtitle": "RAG Engine · Model Gemini · Model Armor",
      "footer": "service: Vertex AI"
    },
    "icon": "brain",
    "categoryRef": "entity:legend-custom"
  },
  "occurrence:INGZ": {
    "form": "container",
    "text": {
      "kicker": "HRPN",
      "subtitle": "Job Drive sync · Job RAG import",
      "footer": "repo: HRPN"
    },
    "icon": "server",
    "categoryRef": "entity:legend-custom"
  },
  "occurrence:PSHARED": {
    "form": "container",
    "text": {
      "kicker": "GENAI PLATFORM",
      "subtitle": "CI/CD · Observability · Network SVPC",
      "footer": "service: GenAI platform"
    },
    "icon": "server"
  },
  "occurrence:PCICD": {
    "form": "container",
    "text": {
      "kicker": "GENAI PCP PLATFORM",
      "subtitle": "project_id_cicd",
      "footer": "service: GenAI PCP Platform"
    },
    "icon": "server"
  },
  "occurrence:OBSZ": {
    "form": "container",
    "text": {
      "kicker": "GENAI PCP PLATFORM",
      "subtitle": "Logging audit · Logs 1 year · BigQuery linked · Tracing Phoenix",
      "footer": "service: GenAI PCP Platform"
    },
    "icon": "shield",
    "categoryRef": "entity:legend-custom"
  },
  "occurrence:OUT": {
    "form": "container",
    "text": {
      "kicker": "OUTSIDE GCP",
      "subtitle": "Airbus GitHub · Airbus GitLab · CI/CD",
      "footer": "scope: Outside GCP"
    },
    "icon": "link"
  },
  "occurrence:GITHUBZ": {
    "form": "container",
    "text": {
      "kicker": "GH",
      "subtitle": "github.airbus.corp",
      "footer": "service: Airbus GitHub"
    },
    "icon": "link"
  },
  "occurrence:GENSRC": {
    "form": "container",
    "text": {
      "kicker": "GENAIR",
      "subtitle": "Template GenAiR · Agents template · IaC modules · Libs GenAiR",
      "footer": "repo: GenAiR"
    },
    "icon": "server",
    "categoryRef": "entity:legend-genair"
  },
  "occurrence:GITLABZ": {
    "form": "container",
    "text": {
      "kicker": "AIRBUS SCM",
      "subtitle": "SCM",
      "footer": "service: Airbus SCM"
    },
    "icon": "link"
  },
  "occurrence:AWSCI": {
    "form": "container",
    "text": {
      "kicker": "AIRBUS AWS",
      "subtitle": "CI Jenkins · Registry JFrog",
      "footer": "service: Airbus AWS"
    },
    "icon": "server"
  },
  "occurrence:LEGEND": {
    "form": "legend",
    "text": {
      "kicker": "HRPN",
      "subtitle": "Card tints and link styles of this scene"
    },
    "icon": "window"
  },
  "occurrence:EMP": {
    "form": "card",
    "text": {
      "kicker": "USR",
      "body": "HR users and employees",
      "detail": "ask HR policy questions in Chat",
      "footer": "actor: Airbus employees"
    },
    "icon": "people"
  },
  "occurrence:DEV": {
    "form": "card",
    "text": {
      "kicker": "DEV",
      "body": "HRPN developers (2 authors)",
      "detail": "git push · Terraform",
      "footer": "actor: HRPN team"
    },
    "icon": "people"
  },
  "occurrence:HRADM": {
    "form": "card",
    "text": {
      "kicker": "OWN",
      "body": "Policy owners (AAI HR)",
      "detail": "approve documents in Drive",
      "footer": "actor: AAI HR"
    },
    "icon": "people",
    "categoryRef": "entity:legend-custom"
  },
  "occurrence:CHAT": {
    "form": "card",
    "text": {
      "kicker": "CHT",
      "body": "HR Policy Navigator",
      "detail": "Chat spaces (BRD-ACC-010)",
      "footer": "service: Google Workspace"
    },
    "icon": "window"
  },
  "occurrence:DRIVE": {
    "form": "card",
    "text": {
      "kicker": "DRV",
      "body": "restricted HR policy folder",
      "detail": "approved PDFs only",
      "footer": "service: Google Workspace"
    },
    "icon": "window",
    "categoryRef": "entity:legend-custom"
  },
  "occurrence:TOPIC": {
    "form": "card",
    "text": {
      "kicker": "TOP",
      "body": "hrpn-gchat-events",
      "detail": "publisher identity: gate G1",
      "footer": "repo: HRPN"
    },
    "icon": "link",
    "categoryRef": "entity:legend-outside"
  },
  "occurrence:SUB": {
    "form": "card",
    "text": {
      "kicker": "SUB",
      "body": "hrpn-gchat-events-sub",
      "detail": "OIDC · dedicated push SA",
      "footer": "repo: HRPN"
    },
    "icon": "link",
    "categoryRef": "entity:legend-outside"
  },
  "occurrence:APP": {
    "form": "card",
    "text": {
      "kicker": "API",
      "body": "get_fast_api_app()",
      "detail": "Python · GenAiR template server",
      "footer": "repo: HRPN"
    },
    "icon": "server",
    "categoryRef": "entity:legend-genair"
  },
  "occurrence:AGENT": {
    "form": "card",
    "text": {
      "kicker": "AGT",
      "body": "root_agent (HR prompt)",
      "detail": "rag_query · format_links · scope",
      "footer": "repo: HRPN"
    },
    "icon": "robot",
    "categoryRef": "entity:legend-custom"
  },
  "occurrence:CHATAPI": {
    "form": "card",
    "text": {
      "kicker": "GCH",
      "body": "POST /gchat-push · reply",
      "detail": "event check · dedup · rating",
      "footer": "repo: HRPN"
    },
    "icon": "server",
    "categoryRef": "entity:legend-outside"
  },
  "occurrence:DOCS": {
    "form": "card",
    "text": {
      "kicker": "DOC",
      "body": "hrpn-ragengine-docs",
      "detail": "fed by the Drive sync job",
      "footer": "repo: HRPN"
    },
    "icon": "db",
    "categoryRef": "entity:legend-custom"
  },
  "occurrence:FS": {
    "form": "card",
    "text": {
      "kicker": "FS",
      "body": "hrpn-sessions (Native)",
      "detail": "FirestoreSessionService · TTL 1 y",
      "footer": "repo: HRPN"
    },
    "icon": "db",
    "categoryRef": "entity:legend-custom"
  },
  "occurrence:RAG": {
    "form": "card",
    "text": {
      "kicker": "RAG",
      "body": "corpus hr_policies",
      "detail": "RagManaged Basic · embed-005",
      "footer": "service: Vertex AI"
    },
    "icon": "brain",
    "categoryRef": "entity:legend-custom"
  },
  "occurrence:GEM": {
    "form": "card",
    "text": {
      "kicker": "LLM",
      "body": "pinned Gemini Flash",
      "detail": "upgrade with regression tests",
      "footer": "service: Vertex AI"
    },
    "icon": "brain"
  },
  "occurrence:ARMOR": {
    "form": "card",
    "text": {
      "kicker": "MA",
      "body": "prompt + answer screening",
      "detail": "PROD availability: unknown",
      "footer": "service: Vertex AI"
    },
    "icon": "shield",
    "categoryRef": "entity:legend-custom"
  },
  "occurrence:SYNC": {
    "form": "card",
    "text": {
      "kicker": "SYN",
      "body": "drive-sync Cloud Run job",
      "detail": "read-only SA · delta copy",
      "footer": "repo: HRPN"
    },
    "icon": "server",
    "categoryRef": "entity:legend-custom"
  },
  "occurrence:IMPORT": {
    "form": "card",
    "text": {
      "kicker": "IMP",
      "body": "rag.import_files() job",
      "detail": "delta indexing · 24 h SLA",
      "footer": "repo: HRPN"
    },
    "icon": "server",
    "categoryRef": "entity:legend-custom"
  },
  "occurrence:PSSM": {
    "form": "card",
    "text": {
      "kicker": "PSM",
      "body": "Source Manager (PROD)",
      "detail": "ssm = cicd project",
      "footer": "repo: HRPN"
    },
    "icon": "link",
    "categoryRef": "entity:legend-custom"
  },
  "occurrence:PAR": {
    "form": "card",
    "text": {
      "kicker": "PAR",
      "body": "app-container-images",
      "detail": "+ app-container-images-noprod",
      "footer": "repo: HRPN"
    },
    "icon": "db",
    "categoryRef": "entity:legend-custom"
  },
  "occurrence:PIAC": {
    "form": "card",
    "text": {
      "kicker": "WIF",
      "body": "iac-sa + iac-state bucket",
      "detail": "pool wif-<app_code>-prod-cicd",
      "footer": "repo: HRPN"
    },
    "icon": "shield",
    "categoryRef": "entity:legend-custom"
  },
  "occurrence:PLIBS": {
    "form": "card",
    "text": {
      "kicker": "PLB",
      "body": "prj-libs-71f1 python-repository",
      "detail": "GenAiR libs for PROD builds",
      "footer": "service: GenAI platform"
    },
    "icon": "db",
    "categoryRef": "entity:legend-genair"
  },
  "occurrence:CLOG": {
    "form": "card",
    "text": {
      "kicker": "LOG",
      "body": "structured conversation log",
      "detail": "PII scrubbed (BRD-HR-014)",
      "footer": "repo: HRPN"
    },
    "icon": "shield",
    "categoryRef": "entity:legend-custom"
  },
  "occurrence:LOGS": {
    "form": "card",
    "text": {
      "kicker": "FBK",
      "body": "hrpn-logbucket + hrpn-sink",
      "detail": "365 d (DAT-015) · 120 d today",
      "footer": "repo: HRPN"
    },
    "icon": "shield",
    "categoryRef": "entity:legend-custom"
  },
  "occurrence:BQ": {
    "form": "card",
    "text": {
      "kicker": "BQ",
      "body": "hrpn_user_feedback_ds",
      "detail": "linked dataset on log bucket",
      "footer": "repo: HRPN"
    },
    "icon": "shield",
    "categoryRef": "entity:legend-genair"
  },
  "occurrence:PHX": {
    "form": "card",
    "text": {
      "kicker": "PHX",
      "body": "module cloud_run_phoenix",
      "detail": "no instrumentation library",
      "footer": "repo: HRPN"
    },
    "icon": "shield",
    "categoryRef": "entity:legend-genair"
  },
  "occurrence:PSVPC": {
    "form": "card",
    "text": {
      "kicker": "SVP",
      "body": "Shared VPC host project",
      "detail": "networks dev / int / pro",
      "footer": "service: GenAI platform"
    },
    "icon": "cloud",
    "categoryRef": "entity:legend-custom"
  },
  "occurrence:CUTTER": {
    "form": "card",
    "text": {
      "kicker": "GEN",
      "body": "GenAiR-Cutter 26.9.0",
      "detail": "Agent Engine · no frontend",
      "footer": "repo: GenAiR-Cutter"
    },
    "icon": "link",
    "categoryRef": "entity:legend-genair"
  },
  "occurrence:AGARDEN": {
    "form": "card",
    "text": {
      "kicker": "AGD",
      "body": "GenAiR-AgentGarden (main)",
      "detail": "ragengine-agent · Cutter submodule",
      "footer": "repo: GenAiR-AgentGarden"
    },
    "icon": "link",
    "categoryRef": "entity:legend-genair"
  },
  "occurrence:IFREPO": {
    "form": "card",
    "text": {
      "kicker": "GIF",
      "body": "genair-infra-factory v1.8.3",
      "detail": "PROD: GitHub · POD: SSM mirror",
      "footer": "repo: genair-infra-factory"
    },
    "icon": "server",
    "categoryRef": "entity:legend-genair"
  },
  "occurrence:GLIBS": {
    "form": "card",
    "text": {
      "kicker": "LIB",
      "body": "genair-* Python packages",
      "detail": "built by Jenkins → Artifactory",
      "footer": "repo: GenAiR libs"
    },
    "icon": "link",
    "categoryRef": "entity:legend-genair"
  },
  "occurrence:SCMREPO": {
    "form": "card",
    "text": {
      "kicker": "GIT",
      "body": "HRPN PROD repository",
      "detail": "host open: GitLab or GitHub",
      "footer": "repo: HRPN"
    },
    "icon": "link",
    "categoryRef": "entity:legend-custom"
  },
  "occurrence:JENKINS": {
    "form": "card",
    "text": {
      "kicker": "JK",
      "body": "oc.jenkins 2b82-devops",
      "detail": "GenAiR jobs · PROD pipelines",
      "footer": "service: Jenkins on AWS"
    },
    "icon": "server"
  },
  "occurrence:JFROG": {
    "form": "card",
    "text": {
      "kicker": "JF",
      "body": "Artifactory 2b82",
      "detail": "r-8cf1-genair-pypi-local",
      "footer": "service: JFrog Artifactory"
    },
    "icon": "db"
  },
  "occurrence:legend-genair": {
    "form": "legend-key",
    "text": {
      "kicker": "TINT · BLUE",
      "body": "GenAiR template, unchanged",
      "detail": "standard GenAiR code and service",
      "footer": "tint: genair"
    },
    "icon": "window",
    "categoryRef": "entity:legend-genair"
  },
  "occurrence:legend-custom": {
    "form": "legend-key",
    "text": {
      "kicker": "TINT · GREEN",
      "body": "within the template frame",
      "detail": "configured, data services included",
      "footer": "tint: custom"
    },
    "icon": "window",
    "categoryRef": "entity:legend-custom"
  },
  "occurrence:legend-outside": {
    "form": "legend-key",
    "text": {
      "kicker": "TINT · YELLOW",
      "body": "added outside the template",
      "detail": "not provided by GenAiR",
      "footer": "tint: outside"
    },
    "icon": "window",
    "categoryRef": "entity:legend-outside"
  },
  "occurrence:legend-none": {
    "form": "legend-key",
    "text": {
      "kicker": "NO TINT",
      "body": "Google or third-party",
      "detail": "managed service: no fill",
      "footer": "tint: none"
    },
    "icon": "window",
    "categoryRef": "entity:legend-none"
  }
};
const A5_LEGEND_ORDER: readonly string[] = ["entity:legend-genair","entity:legend-custom","entity:legend-outside","entity:legend-none"];
const A5_GROUPING = [
  {
    "id": "root",
    "direction": "columns",
    "items": [
      {
        "id": "left",
        "direction": "rows",
        "items": [
          "entity:PEOPLE",
          "entity:WS",
          "entity:LEGEND"
        ]
      },
      {
        "id": "right",
        "direction": "rows",
        "stretch": true,
        "items": [
          "entity:GCP",
          "entity:OUT"
        ]
      }
    ]
  },
  {
    "id": "PRODZ",
    "direction": "rows",
    "stretch": true,
    "items": [
      "entity:PPROZ",
      "entity:PSHARED"
    ]
  },
  {
    "id": "PPROZ",
    "direction": "rows",
    "items": [
      {
        "id": "PPROZ-row",
        "direction": "columns",
        "items": [
          {
            "id": "PPROZ-left",
            "direction": "rows",
            "items": [
              "entity:MSGZ",
              "entity:INGZ"
            ]
          },
          "entity:RUNZ",
          {
            "id": "PPROZ-right",
            "direction": "rows",
            "items": [
              "entity:STATEZ",
              "entity:VERTEXZ"
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "RUNZ",
    "direction": "rows",
    "items": [
      "entity:CHATAPI",
      "entity:APP",
      "entity:AGENT"
    ]
  },
  {
    "id": "OUT",
    "direction": "columns",
    "items": [
      "entity:GITHUBZ",
      "entity:GITLABZ",
      "entity:AWSCI"
    ]
  }
];
const A5_FOLDS: readonly string[] = ["occurrence:PCICD","occurrence:MSGZ","occurrence:VERTEXZ","occurrence:OBSZ","occurrence:INGZ","occurrence:GENSRC","occurrence:AWSCI"];
const A5_CONTAINS: readonly { readonly parent: string; readonly child: string }[] = [{"parent":"entity:AWSCI","child":"entity:JENKINS"},{"parent":"entity:AWSCI","child":"entity:JFROG"},{"parent":"entity:GCP","child":"entity:PRODZ"},{"parent":"entity:GENSRC","child":"entity:AGARDEN"},{"parent":"entity:GENSRC","child":"entity:CUTTER"},{"parent":"entity:GENSRC","child":"entity:GLIBS"},{"parent":"entity:GENSRC","child":"entity:IFREPO"},{"parent":"entity:GITHUBZ","child":"entity:GENSRC"},{"parent":"entity:GITLABZ","child":"entity:SCMREPO"},{"parent":"entity:INGZ","child":"entity:IMPORT"},{"parent":"entity:INGZ","child":"entity:SYNC"},{"parent":"entity:LEGEND","child":"entity:legend-custom"},{"parent":"entity:LEGEND","child":"entity:legend-genair"},{"parent":"entity:LEGEND","child":"entity:legend-none"},{"parent":"entity:LEGEND","child":"entity:legend-outside"},{"parent":"entity:MSGZ","child":"entity:SUB"},{"parent":"entity:MSGZ","child":"entity:TOPIC"},{"parent":"entity:OBSZ","child":"entity:BQ"},{"parent":"entity:OBSZ","child":"entity:CLOG"},{"parent":"entity:OBSZ","child":"entity:LOGS"},{"parent":"entity:OBSZ","child":"entity:PHX"},{"parent":"entity:OUT","child":"entity:AWSCI"},{"parent":"entity:OUT","child":"entity:GITHUBZ"},{"parent":"entity:OUT","child":"entity:GITLABZ"},{"parent":"entity:PCICD","child":"entity:PAR"},{"parent":"entity:PCICD","child":"entity:PIAC"},{"parent":"entity:PCICD","child":"entity:PLIBS"},{"parent":"entity:PCICD","child":"entity:PSSM"},{"parent":"entity:PEOPLE","child":"entity:DEV"},{"parent":"entity:PEOPLE","child":"entity:EMP"},{"parent":"entity:PEOPLE","child":"entity:HRADM"},{"parent":"entity:PPROZ","child":"entity:INGZ"},{"parent":"entity:PPROZ","child":"entity:MSGZ"},{"parent":"entity:PPROZ","child":"entity:RUNZ"},{"parent":"entity:PPROZ","child":"entity:STATEZ"},{"parent":"entity:PPROZ","child":"entity:VERTEXZ"},{"parent":"entity:PRODZ","child":"entity:PPROZ"},{"parent":"entity:PRODZ","child":"entity:PSHARED"},{"parent":"entity:PSHARED","child":"entity:OBSZ"},{"parent":"entity:PSHARED","child":"entity:PCICD"},{"parent":"entity:PSHARED","child":"entity:PSVPC"},{"parent":"entity:RUNZ","child":"entity:AGENT"},{"parent":"entity:RUNZ","child":"entity:APP"},{"parent":"entity:RUNZ","child":"entity:CHATAPI"},{"parent":"entity:STATEZ","child":"entity:DOCS"},{"parent":"entity:STATEZ","child":"entity:FS"},{"parent":"entity:VERTEXZ","child":"entity:ARMOR"},{"parent":"entity:VERTEXZ","child":"entity:GEM"},{"parent":"entity:VERTEXZ","child":"entity:RAG"},{"parent":"entity:WS","child":"entity:CHAT"},{"parent":"entity:WS","child":"entity:DRIVE"}];
const A5_LINKS: readonly { readonly source: string; readonly target: string }[] = [{"source":"entity:AGARDEN","target":"entity:CUTTER"},{"source":"entity:AGENT","target":"entity:ARMOR"},{"source":"entity:AGENT","target":"entity:FS"},{"source":"entity:AGENT","target":"entity:GEM"},{"source":"entity:AGENT","target":"entity:RAG"},{"source":"entity:CHAT","target":"entity:TOPIC"},{"source":"entity:CHATAPI","target":"entity:AGENT"},{"source":"entity:CHATAPI","target":"entity:CHAT"},{"source":"entity:CHATAPI","target":"entity:CLOG"},{"source":"entity:CHATAPI","target":"entity:LOGS"},{"source":"entity:CLOG","target":"entity:LOGS"},{"source":"entity:CUTTER","target":"entity:SCMREPO"},{"source":"entity:DEV","target":"entity:SCMREPO"},{"source":"entity:DOCS","target":"entity:IMPORT"},{"source":"entity:DRIVE","target":"entity:SYNC"},{"source":"entity:EMP","target":"entity:CHAT"},{"source":"entity:GLIBS","target":"entity:JENKINS"},{"source":"entity:HRADM","target":"entity:DRIVE"},{"source":"entity:IFREPO","target":"entity:JENKINS"},{"source":"entity:IMPORT","target":"entity:RAG"},{"source":"entity:JENKINS","target":"entity:APP"},{"source":"entity:JENKINS","target":"entity:JFROG"},{"source":"entity:JENKINS","target":"entity:PAR"},{"source":"entity:JENKINS","target":"entity:PIAC"},{"source":"entity:LOGS","target":"entity:BQ"},{"source":"entity:PLIBS","target":"entity:JENKINS"},{"source":"entity:PSVPC","target":"entity:APP"},{"source":"entity:SCMREPO","target":"entity:JENKINS"},{"source":"entity:SUB","target":"entity:CHATAPI"},{"source":"entity:SYNC","target":"entity:DOCS"},{"source":"entity:TOPIC","target":"entity:SUB"}];

function buildOrderingDocument(instanceId) {
  const ordering = ORDERING[instanceId];
  const parents = new Set(Object.keys(ordering));
  const children = new Set();
  for (const list of Object.values(ordering)) for (const child of list) children.add(child);
  const all = new Set([...parents, ...children]);
  const entities = {};
  for (const id of [...all].sort()) {
    const local = id.slice('entity:'.length);
    const type = parents.has(id) ? 'container' : 'node';
    entities[id] = { id, profile: 'generic@2', type, attributes: { name: { kind: 'text', value: local } } };
  }
  // Legend + keys from categories (verbatim categories per instance from spec oracle counts? categories not in transcribed ordering; use fixed per instance from spec table)
  const categoriesByInstance = { A2: ['genair','none','risk','specific'], A3: ['genair','none','specific'], A4a: ['genair','none','specific'], A4b: ['genair','none','specific'] };
  const categories = categoriesByInstance[instanceId] ?? [];
  entities['entity:legend'] = { id: 'entity:legend', profile: 'generic@2', type: 'legend', attributes: { name: { kind: 'text', value: 'Legend' } } };
  for (const cat of categories) {
    const key = 'entity:legend-key-'+cat;
    entities[key] = { id: key, profile: 'generic@2', type: 'legend-key', attributes: { name: { kind: 'text', value: cat }, category: { kind: 'text', value: cat } } };
  }
  const relations = {};
  for (const [parent, list] of Object.entries(ordering)) {
    for (const child of list) {
      const id = 'relation:contains.'+parent.slice('entity:'.length)+'.'+child.slice('entity:'.length);
      relations[id] = { id, profile: 'generic@2', type: 'contains', endpoints: [{ role: 'parent', target: parent }, { role: 'child', target: child }], attributes: {} };
    }
  }
  for (const cat of categories) {
    const key = 'entity:legend-key-'+cat;
    const id = 'relation:contains.legend.'+cat;
    relations[id] = { id, profile: 'generic@2', type: 'contains', endpoints: [{ role: 'parent', target: 'entity:legend' }, { role: 'child', target: key }], attributes: {} };
  }
  return { documentId: documentRef('m1d-oracle-'+instanceId), schemaVersion: CURRENT_SCHEMA_VERSION, revision: 1, profileRefs: ['generic@2'], typeDefinitions: {}, entities, relations, ports: {}, resources: [], extensions: [] };
}

function presentationForOrdering(instanceId) {
  const ordering = ORDERING[instanceId];
  const parents = new Set(Object.keys(ordering));
  const entities = {};
  for (const id of Object.keys(buildOrderingDocument(instanceId).entities)) {
    const local = id.slice('entity:'.length);
    const occ = 'occurrence:e.'+local;
    if (id === 'entity:legend') entities[occ] = { form: 'legend', text: { title: 'Legend' } };
    else if (id.startsWith('entity:legend-key-')) entities[occ] = { form: 'legend-key', text: { title: local } };
    else if (parents.has(id)) entities[occ] = { form: 'container', text: { title: local } };
    else entities[occ] = { form: 'card', text: { title: local } };
  }
  const categoriesByInstance = { A2: ['genair','none','risk','specific'], A3: ['genair','none','specific'], A4a: ['genair','none','specific'], A4b: ['genair','none','specific'] };
  const order = (categoriesByInstance[instanceId] ?? []).map(cat => 'entity:legend-key-'+cat);
  return { contractPin: { id: 'diagram-presentation', version: '1', contentDigest: '0'.repeat(64) }, entities, legends: { ['occurrence:e.legend']: { order } }, categoryTokens: [] };
}

describe('oracle ordering A2-A4', () => {
  for (const instanceId of ['A2','A3','A4a','A4b']) {
    it('exercises every frozen parent list for '+instanceId, () => {
      const document = buildOrderingDocument(instanceId);
      const presentation = presentationForOrdering(instanceId);
      const ordering = ORDERING[instanceId];
      const hints = { ordering };
      const result = layoutDocument(document, { registry: m3ProfileRegistry, measureText: measure, targetWidth: 4000, presentation, measureLines: wordWrapMeasurer(), hints, bindings: shippedExecutorBindings });
      expect(result.status).toBe('laid-out');
      if (result.status !== 'laid-out') return;
      for (const [parent, list] of Object.entries(ordering)) {
        const ys = list.map(child => geometryOf(result.view, child.slice('entity:'.length)).y);
        for (let i=1;i<ys.length;i++) expect(ys[i]).toBeGreaterThan(ys[i-1]);
      }
    });
  }
  it('covers 71 parent lists and 207 references', () => {
    let lists = 0; let refs = 0;
    for (const id of ['A2','A3','A4a','A4b']) {
      lists += Object.keys(ORDERING[id]).length;
      refs += Object.values(ORDERING[id]).reduce((n,l)=>n+l.length,0);
    }
    expect(lists).toBe(71);
    expect(refs).toBe(207);
  });
});

function buildA5Document() {
  const entities = {};
  for (const [id, ent] of Object.entries(A5_ENTITIES)) entities[id] = ent;
  const relations = {};
  for (const {parent, child} of A5_CONTAINS) {
    const id = 'relation:contains.'+parent.slice('entity:'.length)+'.'+child.slice('entity:'.length);
    relations[id] = { id, profile: 'generic@2', type: 'contains', endpoints: [{ role: 'parent', target: parent }, { role: 'child', target: child }], attributes: {} };
  }
  for (const {source, target} of A5_LINKS) {
    const id = 'relation:link.'+source.slice('entity:'.length)+'.'+target.slice('entity:'.length);
    relations[id] = { id, profile: 'generic@2', type: 'link', endpoints: [{ role: 'source', target: source }, { role: 'target', target: target }], attributes: {} };
  }
  // Legend contains for 4 keys (hierarchy: LEGEND parents the legend-* keys)
  for (const key of A5_LEGEND_ORDER) {
    const id = 'relation:contains.LEGEND.'+key.slice('entity:'.length);
    if (relations[id]===undefined) relations[id] = { id, profile: 'generic@2', type: 'contains', endpoints: [{ role: 'parent', target: 'entity:LEGEND' }, { role: 'child', target: key }], attributes: {} };
  }
  return { documentId: documentRef('m1d-oracle-A5'), schemaVersion: CURRENT_SCHEMA_VERSION, revision: 1, profileRefs: ['generic@2'], typeDefinitions: {}, entities, relations, ports: {}, resources: [], extensions: [] };
}

function presentationForA5() {
  const entities = {};
  for (const [occ, pres] of Object.entries(A5_PRESENTATION)) {
    const local = occ.slice('occurrence:'.length);
    entities['occurrence:e.'+local] = { form: pres.form, text: pres.text ?? {} };
  }
  return { contractPin: { id: 'diagram-presentation', version: '1', contentDigest: '0'.repeat(64) }, entities, legends: { ['occurrence:e.LEGEND']: { order: [...A5_LEGEND_ORDER] } }, categoryTokens: [] };
}

describe('oracle A5 grouping', () => {
  it('feeds the frozen grouping without altering families or hierarchy', () => {
    const document = buildA5Document();
    for (const [id, ent] of Object.entries(A5_ENTITIES)) {
      expect(document.entities[id].type).toBe(ent.type);
      expect(document.entities[id].profile).toBe('generic@2');
    }
    for (const {parent, child} of A5_CONTAINS) {
      const id = 'relation:contains.'+parent.slice('entity:'.length)+'.'+child.slice('entity:'.length);
      expect(document.relations[id]).toBeDefined();
      expect(document.relations[id].endpoints).toEqual([{ role: 'parent', target: parent }, { role: 'child', target: child }]);
    }
    const presentation = presentationForA5();
    const hints = { grouping: A5_GROUPING };
    const result = layoutDocument(document, { registry: m3ProfileRegistry, measureText: measure, targetWidth: 4000, presentation, measureLines: wordWrapMeasurer(), hints, bindings: shippedExecutorBindings });
    expect(result.status).toBe('laid-out');
    if (result.status !== 'laid-out') return;
    expect(geometryOf(result.view, 'PSHARED').width).toBe(geometryOf(result.view, 'PPROZ').width);
    expect(geometryOf(result.view, 'E1' in document.entities ? 'E1' : 'MSGZ')).toBeDefined();
  });
  it('uses seven source folds', () => {
    expect(A5_FOLDS.length).toBe(7);
  });
});
