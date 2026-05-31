'use client'

import React, { createContext, useContext, useEffect, useReducer } from 'react'
import { AppState, Protocol, TestRun, Fixture, Failure } from './types'
import { MOCK_PROTOCOLS, MOCK_TEST_RUNS, MOCK_FIXTURES, MOCK_FAILURES } from './mock-data'

const STORAGE_KEY = 'testbench_v1'

type Action =
  | { type: 'LOAD'; payload: AppState }
  | { type: 'ADD_PROTOCOL'; payload: Protocol }
  | { type: 'UPDATE_PROTOCOL'; payload: Protocol }
  | { type: 'DELETE_PROTOCOL'; payload: string }
  | { type: 'ADD_TEST_RUN'; payload: TestRun }
  | { type: 'UPDATE_TEST_RUN'; payload: TestRun }
  | { type: 'DELETE_TEST_RUN'; payload: string }
  | { type: 'ADD_FIXTURE'; payload: Fixture }
  | { type: 'UPDATE_FIXTURE'; payload: Fixture }
  | { type: 'DELETE_FIXTURE'; payload: string }
  | { type: 'ADD_FAILURE'; payload: Failure }
  | { type: 'UPDATE_FAILURE'; payload: Failure }
  | { type: 'DELETE_FAILURE'; payload: string }

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'LOAD':
      return action.payload
    case 'ADD_PROTOCOL':
      return { ...state, protocols: [...state.protocols, action.payload] }
    case 'UPDATE_PROTOCOL':
      return { ...state, protocols: state.protocols.map(p => p.id === action.payload.id ? action.payload : p) }
    case 'DELETE_PROTOCOL':
      return { ...state, protocols: state.protocols.filter(p => p.id !== action.payload) }
    case 'ADD_TEST_RUN':
      return { ...state, testRuns: [...state.testRuns, action.payload] }
    case 'UPDATE_TEST_RUN':
      return { ...state, testRuns: state.testRuns.map(tr => tr.id === action.payload.id ? action.payload : tr) }
    case 'DELETE_TEST_RUN':
      return { ...state, testRuns: state.testRuns.filter(tr => tr.id !== action.payload) }
    case 'ADD_FIXTURE':
      return { ...state, fixtures: [...state.fixtures, action.payload] }
    case 'UPDATE_FIXTURE':
      return { ...state, fixtures: state.fixtures.map(f => f.id === action.payload.id ? action.payload : f) }
    case 'DELETE_FIXTURE':
      return { ...state, fixtures: state.fixtures.filter(f => f.id !== action.payload) }
    case 'ADD_FAILURE':
      return { ...state, failures: [...state.failures, action.payload] }
    case 'UPDATE_FAILURE':
      return { ...state, failures: state.failures.map(f => f.id === action.payload.id ? action.payload : f) }
    case 'DELETE_FAILURE':
      return { ...state, failures: state.failures.filter(f => f.id !== action.payload) }
    default:
      return state
  }
}

const defaultState: AppState = {
  protocols: MOCK_PROTOCOLS,
  testRuns: MOCK_TEST_RUNS,
  fixtures: MOCK_FIXTURES,
  failures: MOCK_FAILURES,
}

interface StoreCtx {
  state: AppState
  dispatch: React.Dispatch<Action>
}

const Ctx = createContext<StoreCtx | null>(null)

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, defaultState)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) dispatch({ type: 'LOAD', payload: JSON.parse(raw) })
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // ignore
    }
  }, [state])

  return <Ctx.Provider value={{ state, dispatch }}>{children}</Ctx.Provider>
}

export function useStore() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useStore must be used inside StoreProvider')
  return ctx
}
