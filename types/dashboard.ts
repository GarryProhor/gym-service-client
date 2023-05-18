import { IGymPart } from './gymparts'

export interface IDashboardSlider {
  items: IGymPart[]
  spinner: boolean
  goToPartPage?: boolean
}

export interface ICartAlertProps {
  count: number
  closeAlert: VoidFunction
}
