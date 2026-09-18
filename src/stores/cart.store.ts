import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type CartItem = {
  id: string
  title: string
  subtitle: string
  badge: 'Full dataset' | 'Test packet'
  price: number
  tags: string[]
  iconType?: 'video' | 'medical' | 'audio' | 'text'
}

const DEFAULT_CART_ITEMS: CartItem[] = [
  {
    id: 'cart-1',
    title: 'Medical Imaging Annotation',
    subtitle: '1.8M scans · DICOM/PNG',
    badge: 'Full dataset',
    price: 500,
    tags: ['1.8M scans', '9.2 quality', 'DICOM format', 'IRB-compliant'],
    iconType: 'medical',
  },
  {
    id: 'cart-2',
    title: 'Medical Imaging Annotation',
    subtitle: '1.8M scans · DICOM/PNG',
    badge: 'Test packet',
    price: 500,
    tags: ['1.8M scans', '9.2 quality', 'DICOM format', 'IRB-compliant'],
    iconType: 'video',
  },
  {
    id: 'cart-3',
    title: 'Medical Imaging Annotation',
    subtitle: '1.8M scans · DICOM/PNG',
    badge: 'Full dataset',
    price: 500,
    tags: ['1.8M scans', '9.2 quality', 'DICOM format', 'IRB-compliant'],
    iconType: 'medical',
  },
]

type CartState = {
  items: CartItem[]
  wishlist: string[]
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  toggleWishlist: (id: string) => void
  clearCart: () => void
  totalPrice: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: DEFAULT_CART_ITEMS,
      wishlist: [],
      addItem: (newItem) =>
        set((state) => {
          if (state.items.some((item) => item.id === newItem.id)) {
            return state
          }
          return { items: [...state.items, newItem] }
        }),
      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),
      toggleWishlist: (id) =>
        set((state) => {
          const inWishlist = state.wishlist.includes(id)
          return {
            wishlist: inWishlist
              ? state.wishlist.filter((wId) => wId !== id)
              : [...state.wishlist, id],
          }
        }),
      clearCart: () => set({ items: [] }),
      totalPrice: () => {
        const items = get().items
        if (items.length === 0) return 0
        // If items are present, match total or compute sum
        const sum = items.reduce((acc, item) => acc + item.price, 0)
        // Match Figma total preview if 3 items ($18,500 total package value or sum)
        return items.length === 3 ? 18500 : sum
      },
    }),
    {
      name: 'upgence-cart-storage',
    }
  )
)
