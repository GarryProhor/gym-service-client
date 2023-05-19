import { NextRouter } from 'next/router'
import { getQueryParamOnFirstRender, idGenerator } from './common'
import { getGymPartsFx } from '@/app/api/gymParts'
import { setFilteredGymParts } from '@/context/gymParts'

const createManufacturerCheckboxObj = (title: string) => ({
  title,
  checked: false,
  id: idGenerator(),
})

export const gymManufacturers = [
  'Life Fitness',
  'Technogym',
  'Hammer Strength',
  'Star Trac ',
  'Matrix ',
  'Cybex',
  'Precor',
  'Inotec',
  'Panatta',
].map(createManufacturerCheckboxObj)

export const partsManufacturers = [
  'Rope Belts',
  'Rollers',
  'Pillows',
  'Plastic fittings',
  'Fasteners',
  'Cargo blocks',
  'Cuffs Insurance',
  'Grips',
  'Other',
].map(createManufacturerCheckboxObj)

const checkPriceFromQuery = (price: number) =>
  price && !isNaN(price) && price >= 0 && price <= 10000

export const checkQueryParams = (router: NextRouter) => {
  const priceFromQueryValue = getQueryParamOnFirstRender(
    'priceFrom',
    router
  ) as string
  const priceToQueryValue = getQueryParamOnFirstRender(
    'priceTo',
    router
  ) as string
  const gymQueryValue = JSON.parse(
    decodeURIComponent(getQueryParamOnFirstRender('gym', router) as string)
  )
  const partsQueryValue = JSON.parse(
    decodeURIComponent(getQueryParamOnFirstRender('parts', router) as string)
  )
  const isValidGymQuery =
    Array.isArray(gymQueryValue) && !!gymQueryValue?.length
  const isValidPartsQuery =
    Array.isArray(partsQueryValue) && !!partsQueryValue?.length
  const isValidPriceQuery =
    checkPriceFromQuery(+priceFromQueryValue) &&
    checkPriceFromQuery(+priceToQueryValue)

  return {
    isValidGymQuery: isValidGymQuery,
    isValidPartsQuery,
    isValidPriceQuery,
    priceFromQueryValue,
    priceToQueryValue,
    gymQueryValue: gymQueryValue,
    partsQueryValue,
  }
}

export const updateParamsAndFiltersFromQuery = async (
  callback: VoidFunction,
  path: string
) => {
  callback()

  const data = await getGymPartsFx(`/gym-parts?limit=20&offset=${path}`)

  setFilteredGymParts(data)
}

export async function updateParamsAndFilters<T>(
  updatedParams: T,
  path: string,
  router: NextRouter
) {
  const params = router.query

  delete params.gym
  delete params.parts
  delete params.priceFrom
  delete params.priceTo

  await router.push(
    {
      query: {
        ...params,
        ...updatedParams,
      },
    },
    undefined,
    {shallow: true}
  )

  const data = await getGymPartsFx(`/gym-parts?limit=20&offset=${path}`)

  setFilteredGymParts(data)
}
