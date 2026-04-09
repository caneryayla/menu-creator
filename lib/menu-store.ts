"use client"

import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

export type IngredientInput = {
  ingredientId: string
  ingredientName: string
}

export type DishInput = {
  dishId: string
  dishName: string
  dishImage?: string
  ingredients: IngredientInput[]
  instructions: string
}

export type MenuInput = {
  menuName: string
  menuImage?: string
  dishList: DishInput[]
}

export type MenuItem = MenuInput & {
  id: string
  createdAt: string
  updatedAt: string
}

type MenuStore = {
  menus: MenuItem[]
  addMenu: (input: MenuInput) => void
  updateMenu: (id: string, input: MenuInput) => void
  deleteMenu: (id: string) => void
}

function normalizeIngredient(raw: unknown): IngredientInput {
  const value = raw as Record<string, unknown>
  return {
    ingredientId: String(value.ingredientId ?? ""),
    ingredientName: String(value.ingredientName ?? ""),
  }
}

function normalizeDish(raw: unknown): DishInput {
  const value = raw as Record<string, unknown>
  const ingredientsRaw = Array.isArray(value.ingredients) ? value.ingredients : []
  return {
    dishId: String(value.dishId ?? ""),
    dishName: String(value.dishName ?? ""),
    dishImage: String(value.dishImage ?? ""),
    ingredients: ingredientsRaw.map(normalizeIngredient),
    instructions: String(value.instructions ?? ""),
  }
}

function normalizeMenuFromStorage(raw: unknown): MenuItem {
  const value = raw as Record<string, unknown>
  const dishListRaw = Array.isArray(value.dishList) ? value.dishList : []
  return {
    id: String(value.id ?? ""),
    menuName: String(value.menuName ?? ""),
    menuImage: String(value.menuImage ?? ""),
    dishList: dishListRaw.map(normalizeDish),
    createdAt: String(value.createdAt ?? new Date().toISOString()),
    updatedAt: String(value.updatedAt ?? new Date().toISOString()),
  }
}

export const useMenuStore = create<MenuStore>()(
  persist(
    (set) => ({
      menus: [],
      addMenu: (input) =>
        set((state) => ({
          menus: [
            ...state.menus,
            {
              ...input,
              id: crypto.randomUUID(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
        })),
      updateMenu: (id, input) =>
        set((state) => ({
          menus: state.menus.map((menu) =>
            menu.id === id
              ? {
                  ...menu,
                  ...input,
                  updatedAt: new Date().toISOString(),
                }
              : menu
          ),
        })),
      deleteMenu: (id) =>
        set((state) => ({
          menus: state.menus.filter((menu) => menu.id !== id),
        })),
    }),
    {
      name: "menu-storage",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<MenuStore> | undefined
        if (!persisted || !Array.isArray(persisted.menus)) {
          return { ...currentState }
        }
        return {
          ...currentState,
          ...persisted,
          menus: persisted.menus.map(normalizeMenuFromStorage),
        }
      },
    }
  )
)