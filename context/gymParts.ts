import { IGymParts } from '@/types/gymparts'
import { IFilterCheckboxItem } from '@/types/catalog'
import { gymManufacturers, partsManufacturers } from '@/utils/catalog'
import { createDomain } from 'effector-next'

const gymParts = createDomain()

export const setGymParts = gymParts.createEvent<IGymParts>()
export const setGymPartsCheapFirst = gymParts.createEvent()
export const setGymPartsExpensiveFirst = gymParts.createEvent()
export const setGymPartsByPopularity = gymParts.createEvent()
export const setFilteredGymParts = gymParts.createEvent()
export const setGymManufacturers =
  gymParts.createEvent<IFilterCheckboxItem[]>()
export const updateGymManufacturer =
  gymParts.createEvent<IFilterCheckboxItem>()
export const setPartsManufacturers =
  gymParts.createEvent<IFilterCheckboxItem[]>()
export const updatePartsManufacturer =
  gymParts.createEvent<IFilterCheckboxItem>()
export const setGymManufacturersFromQuery =
  gymParts.createEvent<string[]>()
export const setPartsManufacturersFromQuery =
  gymParts.createEvent<string[]>()

const updateManufacturer = (
  manufacturers: IFilterCheckboxItem[],
  id: string,
  payload: Partial<IFilterCheckboxItem>
) =>
  manufacturers.map((item) => {
    if (item.id === id) {
      return {
        ...item,
        ...payload,
      }
    }

    return item
  })

const updateManufacturerFromQuery = (
  manufacturers: IFilterCheckboxItem[],
  manufacturersFromQuery: string[]
) =>
  manufacturers.map((item) => {
    if (manufacturersFromQuery.find((title) => title === item.title)) {
      return {
        ...item,
        checked: true,
      }
    }

    return item
  })

export const $gymParts = gymParts
  .createStore<IGymParts>({} as IGymParts)
  .on(setGymParts, (_, parts) => parts)
  .on(setGymPartsCheapFirst, (state) => ({
    ...state,
    rows: state.rows.sort((a, b) => a.price - b.price),
  }))
  .on(setGymPartsExpensiveFirst, (state) => ({
    ...state,
    rows: state.rows.sort((a, b) => b.price - a.price),
  }))
  .on(setGymPartsByPopularity, (state) => ({
    ...state,
    rows: state.rows.sort((a, b) => b.popularity - a.popularity),
  }))

export const $gymManufacturers = gymParts
  .createStore<IFilterCheckboxItem[]>(
    gymManufacturers as IFilterCheckboxItem[]
  )
  .on(setGymManufacturers, (_, parts) => parts)
  .on(updateGymManufacturer, (state, payload) => [
    ...updateManufacturer(state, payload.id as string, {
      checked: payload.checked,
    }),
  ])
  .on(setGymManufacturersFromQuery, (state, manufacturersFromQuery) => [
    ...updateManufacturerFromQuery(state, manufacturersFromQuery),
  ])

export const $partsManufacturers = gymParts
  .createStore<IFilterCheckboxItem[]>(
    partsManufacturers as IFilterCheckboxItem[]
  )
  .on(setPartsManufacturers, (_, parts) => parts)
  .on(updatePartsManufacturer, (state, payload) => [
    ...updateManufacturer(state, payload.id as string, {
      checked: payload.checked,
    }),
  ])
  .on(setPartsManufacturersFromQuery, (state, manufacturersFromQuery) => [
    ...updateManufacturerFromQuery(state, manufacturersFromQuery),
  ])

export const $filteredGymParts = gymParts
  .createStore<IGymParts>({} as IGymParts)
  .on(setFilteredGymParts, (_, parts) => parts)
