export interface IGymPart {
  id: number
  gym_manufacturer: string
  price: number
  parts_manufacturer: string
  vendor_code: string
  name: string
  description: string
  images: string
  in_stock: number
  bestseller: boolean
  new: boolean
  popularity: number
  compatibility: string
}

export interface IGymParts {
  count: number
  rows: IGymPart[]
}
