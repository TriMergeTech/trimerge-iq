# TriMerge AI Operating System (Working Name)

## Overview

This project defines an AI-powered organizational operating system where a chat interface acts as a **company intelligence and execution layer**.

The system enables:

- Conversational access to company data
- Role-aware AI responses
- Task delegation through chat
- Tool-based execution of actions
- Structured organizational hierarchy mapping

At its core, the AI is not just a chatbot — it is an **operational layer over a company structure**.

---

## Core Concept

The system is built around three main primitives:

### 1. Profiles (People Layer)

Every entity in the system is a **profile**, including:

- CEO
- Admin
- Staff
- (Optional) Clients as data structures

Each profile contains:

- Name
- Role
- Description
- Responsibilities
- Assigned tools

---

### 2. Tools (Action Layer)

Tools are atomic actions the system can execute.

Examples:

- `assign_task`
- `create_project`
- `request_information`
- `generate_report`

Tools define:

- What can be done
- Required inputs
- Execution behavior

---

### 3. AI Chat (Intelligence Layer)

The chat system:

- Understands user intent
- Reads profile context
- Selects appropriate tools
- Routes execution to the system

It operates in two modes:

- Conversational mode (Q&A, insights)
- Action mode (task creation, execution, delegation)

---

## System Behavior

### Role-Based Interaction

All users interact through role-aware AI personas:

- CEO can manage and delegate
- Staff receive tasks and respond with context
- Admin manages system structure

---

### Task Delegation Flow

1. User sends prompt
2. AI interprets intent
3. AI selects a tool
4. System resolves appropriate staff
5. Task is assigned or executed

---

### Persona Interaction

The system supports indirect communication between roles:

- CEO can query staff through AI
- Staff can receive structured instructions
- AI mediates all interactions

---

## Key Design Principle

> The AI selects tools — not people directly.

People (profiles) are used as:

- Context providers
- Capability holders
- Execution targets

Tools are the actual execution interface.

---

## Example Use Case

**Prompt:**

> “Create a proposal for Client A”

**System Flow:**

- AI selects: `assign_task`
- System identifies proposal staff
- Task is created and assigned
- Staff receives instruction via chat

---

## Architecture Summary

- Profiles → Define who the system knows
- Tools → Define what the system can do
- AI Chat → Decides what should happen

---

## Status

This is an early-stage system design specification.

Future expansions:

- Tool schema definition
- Permission system
- Execution engine design
- Memory + data graph layer

---

## Vision

To build a **self-operating organizational AI layer** where communication, decision-making, and execution all occur through natural language.
