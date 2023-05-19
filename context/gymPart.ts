import { IGymPart } from '@/types/gymparts'
import { createDomain } from 'effector-next'

const gymPart = createDomain()

export const setGymPart = gymPart.createEvent<IGymPart>()

export const $gymPart = gymPart
  .createStore<IGymPart>({} as IGymPart)
  .on(setGymPart, (_, part) => part)
