/* eslint-disable indent */
import { useStore } from 'effector-react'
import { useEffect, useState } from 'react'
import Select from 'react-select'
import { $mode } from '@/context/mode'
import {
  controlStyles,
  menuStyles,
  selectStyles,
} from '@/styles/catalog/select'
import { optionStyles } from '@/styles/searchInput'
import { IOption, SelectOptionType } from '@/types/common'
import { createSelectOption } from '@/utils/common'
import { categoriesOptions } from '@/utils/selectContents'
import {
  $gymParts,
  setGymPartsByPopularity,
  setGymPartsCheapFirst,
  setGymPartsExpensiveFirst,
} from '@/context/gymParts'
import { useRouter } from 'next/router'

const FilterSelect = ({
                        setSpinner,
                      }: {
  setSpinner: (arg0: boolean) => void
}) => {
  const mode = useStore($mode)
  const gymParts = useStore($gymParts)
  const [categoryOption, setCategoryOption] = useState<SelectOptionType>(null)
  const router = useRouter()

  useEffect(() => {
    if (gymParts.rows) {
      switch (router.query.first) {
        case 'cheap':
          updateCategoryOption('Сначала дешевые')
          setGymPartsCheapFirst()
          break
        case 'expensive':
          updateCategoryOption('Сначала дорогие')
          setGymPartsExpensiveFirst()
          break
        case 'popular':
          updateCategoryOption('По популярности')
          setGymPartsByPopularity()
          break
        default:
          updateCategoryOption('Сначала дешевые')
          setGymPartsCheapFirst()
          break
      }
    }
  }, [gymParts.rows, router.query.first])

  const updateCategoryOption = (value: string) =>
    setCategoryOption({ value, label: value })

  const updateRoteParam = (first: string) =>
    router.push(
      {
        query: {
          ...router.query,
          first,
        },
      },
      undefined,
      { shallow: true }
    )

  const handleSortOptionChange = (selectedOption: SelectOptionType) => {
    setSpinner(true)
    setCategoryOption(selectedOption)

    switch ((selectedOption as IOption).value) {
      case 'Сначала дешевые':
        setGymPartsCheapFirst()
        updateRoteParam('cheap')
        break
      case 'Сначала дорогие':
        setGymPartsExpensiveFirst()
        updateRoteParam('expensive')
        break
      case 'По популярности':
        setGymPartsByPopularity()
        updateRoteParam('popular')
        break
    }

    setTimeout(() => setSpinner(false), 1000)
  }

  return (
    <Select
      placeholder="Я ищу..."
      value={categoryOption || createSelectOption('Сначала дешевые')}
      onChange={handleSortOptionChange}
      styles={{
        ...selectStyles,
        control: (defaultStyles) => ({
          ...controlStyles(defaultStyles, mode),
        }),
        input: (defaultStyles) => ({
          ...defaultStyles,
          color: mode === 'dark' ? '#f2f2f2' : '#222222',
        }),
        menu: (defaultStyles) => ({
          ...menuStyles(defaultStyles, mode),
        }),
        option: (defaultStyles, state) => ({
          ...optionStyles(defaultStyles, state, mode),
        }),
      }}
      isSearchable={false}
      options={categoriesOptions}
    />
  )
}

export default FilterSelect
