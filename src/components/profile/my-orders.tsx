'use client'

import React from 'react'
import Link from 'next/link'

export interface OrderItem {
  id: string
  datasetId: string
  datasetTitle: string
  datasetSlug: string
  amount: number
  currency: string
  status: string
  createdAt: string
  invoiceUrl?: string
}

interface MyOrdersProps {
  orders?: OrderItem[]
}

export function MyOrders({ orders = [] }: MyOrdersProps) {
  return (
    <div className="w-full" id="orders-section">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">My orders</h2>
        <p className="text-sm text-gray-500 mt-1">
          Track all order status and download datasets and invoice
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm">
          <h3 className="mb-1 text-base font-semibold text-gray-900">
            No datasets purchased yet
          </h3>
          <p className="mb-6 text-sm text-gray-500">
            Explore the marketplace to purchase datasets you&apos;re interested in.
          </p>

          <Link
            href="/datasets"
            className="rounded-lg bg-[#2563EB] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            Explore datasets
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md"
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
                    Order #{order.id.slice(0, 8)}
                  </span>
                  <h3 className="text-base font-bold text-gray-900 mt-0.5">
                    {order.datasetTitle}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Purchased on {new Date(order.createdAt).toLocaleDateString()} • {order.currency} ${order.amount}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 capitalize">
                    {order.status}
                  </span>

                  <Link
                    href={`/datasets/${order.datasetSlug}`}
                    className="rounded-lg border border-blue-600 px-4 py-2 text-xs font-semibold text-blue-600 transition-colors hover:bg-blue-50"
                  >
                    View Dataset
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
