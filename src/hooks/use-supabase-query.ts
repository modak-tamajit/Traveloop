import {useEffect, useRef, useState} from "react"

export type QueryStatus = "idle" | "loading" | "success" | "error"

export type QueryState<T> = {
  data: T
  error: string | null
  status: QueryStatus
  isLoading: boolean
}

export function useSupabaseQuery<T>(cacheKey: string, initialData: T, loader: () => Promise<T>): QueryState<T> {
  const loaderRef = useRef(loader)
  const [state, setState] = useState<QueryState<T>>({
    data: initialData,
    error: null,
    status: "idle",
    isLoading: false,
  })

  useEffect(() => {
    loaderRef.current = loader
  }, [loader])

  useEffect(() => {
    let isActive = true

    Promise.resolve()
      .then(() => {
        if (isActive) {
          setState((current) => ({...current, error: null, status: "loading", isLoading: true}))
        }
        return loaderRef.current()
      })
      .then((data) => {
        if (isActive) {
          setState({data, error: null, status: "success", isLoading: false})
        }
      })
      .catch((error: unknown) => {
        if (isActive) {
          const message = error instanceof Error ? error.message : "Unable to load data"
          setState((current) => ({...current, error: message, status: "error", isLoading: false}))
        }
      })

    return () => {
      isActive = false
    }
  }, [cacheKey])

  return state
}
