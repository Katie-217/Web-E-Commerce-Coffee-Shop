import React, { useEffect, useState } from 'react';
import { OrderDetail as OrderDetailType } from '../../types';
import Badge from '../../components/Badge';
import { Edit, ShoppingCart, CheckCircle2 } from 'lucide-react';
import { formatVND } from '../../../../utils/currency';
import { fetchCustomerById } from '../../../../api/customers';
import BackButton from '../../components/BackButton';

interface OrderDetailProps {
  order: OrderDetailType;
  onBack: () => void;
}

const OrderDetail: React.FC<OrderDetailProps> = ({ order, onBack }) => {
  const getDisplayCode = (val: string | number | undefined | null) => {
    const s = String(val || '');
    if (!s) return '';
    const hex = s.replace(/[^a-fA-F0-9]/g, '') || s;
    const last4 = hex.slice(-4).padStart(4, '0');
    return `#${last4}`;
  };

  const formatAddress = (addr: any) => {
    if (!addr) return '';
    const parts = [addr.street, addr.city, addr.state, addr.zip, addr.country]
      .filter(Boolean)
      .map((p: string) => String(p).trim());
    return parts.join(', ');
  };
  const [hydratedShipping, setHydratedShipping] = useState<any>(order.shippingAddress);
  const [hydratedBilling, setHydratedBilling] = useState<any>(order.billingAddress);
  const shippingAddrText = formatAddress(hydratedShipping);
  const billingAddrText = formatAddress(hydratedBilling);

  const addressLines = (addr: any): string[] => {
    if (!addr) return [];
    const lines: string[] = [];
    if (addr.street) lines.push(String(addr.street));
    if (addr.city && !addr.state && !addr.zip) {
      lines.push(String(addr.city));
    } else if (addr.city) {
      lines.push(String(addr.city));
    }
    if (addr.zip || addr.state) {
      const third = [addr.zip, addr.state].filter(Boolean).join(', ');
      if (third) lines.push(third);
    }
    if (addr.country) lines.push(String(addr.country));
    return lines.length ? lines : [];
  };
  const shippingLines = addressLines(hydratedShipping);
  const billingLines = addressLines(hydratedBilling);

  // Enrich from customer profile if order lacks address
  useEffect(() => {
    const needShipping = !shippingLines.length;
    const needBilling = !billingLines.length;
    const key = (order as any)?.customer?.id || (order as any)?.customerEmail;
    if (!key || (!needShipping && !needBilling)) return;
    (async () => {
      try {
        const res = await fetchCustomerById(String(key));
        const c = res?.data || res;
        const arr: any[] = c?.addresses || [];
        if (Array.isArray(arr) && arr.length) {
          const pick = (type: string) => arr.find((a: any) => (a.type || '').toLowerCase() === type && a.isDefault)
            || arr.find((a: any) => (a.type || '').toLowerCase() === type);
          const norm = (a: any) => a ? ({
            street: [a.addressLine1, a.addressLine2].filter(Boolean).join(', '),
            city: a.city || '',
            state: a.district || '',
            zip: a.postalCode || '',
            country: a.country || ''
          }) : undefined;
          if (needShipping) setHydratedShipping(norm(pick('shipping') || arr[0]));
          if (needBilling) setHydratedBilling(norm(pick('billing')));
          
        }
      } catch {}
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order]);
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'green';
      case 'Pending Payment':
        return 'yellow';
      case 'Failed':
        return 'red';
      case 'Refunded':
        return 'gray';
      default:
        return 'gray';
    }
  };

  const getOrderStatusColor = (status: string): 'green' | 'yellow' | 'red' | 'gray' | 'blue' => {
    switch (status) {
      case 'Ready to Pickup':
        return 'green';
      case 'Delivered':
        return 'green';
      case 'Processing':
        return 'blue';
      case 'Pending':
        return 'yellow';
      case 'Cancelled':
        return 'red';
      default:
        return 'gray';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-background-light p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-start gap-3">
            <BackButton onClick={onBack} label="Back to orders" className="mt-1" />
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-text-primary">Order {getDisplayCode(order.id)}</h1>
                <Badge color={getStatusColor(order.paymentStatus || 'Pending')}>
                  {order.paymentStatus || 'Pending'}
                </Badge>
                <Badge color={getOrderStatusColor(order.status)}>
                  {order.status === 'Processing' ? 'Ready to Pickup' : order.status}
                </Badge>
              </div>
              <p className="text-sm text-text-secondary">{order.date}</p>
            </div>
          </div>
          <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
            Delete Order
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Details */}
          <div className="bg-background-light p-6 rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-text-primary">Order details</h2>
              <button className="text-primary hover:text-primary/80 flex items-center gap-2">
                <Edit size={16} />
                Edit
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-700 text-sm text-text-secondary">
                    <th className="p-3">PRODUCTS</th>
                    <th className="p-3">PRICE</th>
                    <th className="p-3">QTY</th>
                    <th className="p-3">TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr key={item.id} className="border-b border-gray-700">
                      <td className="p-3">
                        <div>
                          <p className="font-medium text-text-primary">{item.name}</p>
                          {item.variant && (
                            <p className="text-sm text-text-secondary">{item.variant}</p>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-text-secondary">{formatVND(item.price)}</td>
                      <td className="p-3 text-text-secondary">{item.quantity}</td>
                      <td className="p-3 font-semibold text-text-primary">{formatVND(item.price * item.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-700 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-secondary">Subtotal:</span>
                <span className="text-text-primary font-medium">{formatVND(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Discount:</span>
                <span className="text-text-primary font-medium">-{formatVND(Math.abs(order.discount))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Tax:</span>
                <span className="text-text-primary font-medium">{formatVND(order.tax)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-700 font-bold text-lg">
                <span className="text-text-primary">Total:</span>
                <span className="text-text-primary">{formatVND(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Shipping Activity */}
          <div className="bg-background-light p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold text-text-primary mb-4">Shipping activity</h2>
            <div className="relative pl-6">
              {/* Vertical line */}
              <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-700"></div>
              
              {order.shippingActivity.map((activity, index) => (
                <div key={index} className="relative mb-6 last:mb-0">
                  {/* Circle marker */}
                  <div className={`absolute -left-7 top-1 w-4 h-4 rounded-full border-2 ${
                    activity.completed 
                      ? 'bg-primary border-primary' 
                      : 'bg-gray-700 border-gray-700'
                  }`}>
                    {activity.completed && (
                      <CheckCircle2 size={12} className="text-white absolute top-0.5 left-0.5" />
                    )}
                  </div>
                  
                  <div className="pb-4">
                    <p className="font-semibold text-text-primary">{activity.status}</p>
                    <p className="text-sm text-text-secondary mt-1">{activity.description}</p>
                    {(activity.date || activity.time) && (
                      <p className="text-xs text-text-secondary mt-1">
                        {activity.date} {activity.time}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Side Info */}
        <div className="space-y-6">
          {/* Customer Details */}
          <div className="bg-background-light p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold text-text-primary mb-4">Customer details</h2>
            <div className="flex flex-col items-center mb-4">
              <img 
                src={order.customer?.avatar} 
                alt={order.customer?.name || 'Customer'} 
                className="w-20 h-20 rounded-xl mb-3"
              />
              <p className="font-bold text-text-primary">{order.customer?.name || 'Customer'}</p>
              {(order.customer?.id) && (
                <p className="text-sm text-text-secondary">Customer ID: {getDisplayCode(order.customer.id)}</p>
              )}
              {!!order.customer?.totalOrders && (
                <div className="flex items-center gap-2 mt-2 text-text-secondary">
                  <ShoppingCart size={16} />
                  <span className="text-sm">{order.customer.totalOrders} Orders</span>
                </div>
              )}
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-text-secondary mb-1">Email:</p>
                <p className="text-text-primary">{order.customer?.email || '-'}</p>
              </div>
              <div>
                <p className="text-text-secondary mb-1">Mobile:</p>
                <p className="text-text-primary">{order.customer?.phone || '-'}</p>
              </div>
            </div>
            <button className="mt-4 w-full text-primary hover:text-primary/80 flex items-center justify-center gap-2 border border-primary rounded-lg py-2">
              <Edit size={16} />
              Edit
            </button>
          </div>

          {/* Shipping Address */}
          <div className="bg-background-light p-6 rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-text-primary">Shipping address</h2>
              <button className="text-primary hover:text-primary/80">
                <Edit size={16} />
              </button>
            </div>
            <div className="text-sm text-text-secondary leading-relaxed">
              {shippingLines.length > 0 ? (
                shippingLines.map((ln, i) => (
                  <p key={i}>{ln}</p>
                ))
              ) : (
                <p>-</p>
              )}
            </div>
          </div>

          {/* Billing Address (hide if empty or same as shipping) */}
          {billingLines.length > 0 && billingAddrText !== shippingAddrText && (
            <div className="bg-background-light p-6 rounded-lg shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-text-primary">Billing address</h2>
                <button className="text-primary hover:text-primary/80">
                  <Edit size={16} />
                </button>
              </div>
              <div className="text-sm text-text-secondary leading-relaxed">
                {billingLines.map((ln, i) => (
                  <p key={i}>{ln}</p>
                ))}
              </div>
            </div>
          )}

          {/* Payment Info */}
          <div className="bg-background-light p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold text-text-primary mb-1">Payment</h2>
            {(() => {
              const pmType = String(((order as any).paymentType || order.paymentMethod?.type || '')).toLowerCase();
              const pm: any = (order as any).paymentMethod || order.paymentMethod;
              return (
                <div className="space-y-1 text-sm text-text-secondary">
                  <p>Payment Type: <span className="text-text-primary">{pmType || '-'}</span></p>
                  {pmType === 'bank' && (
                    <>
                      <p>Linked Bank: <span className="text-text-primary">{pm?.provider || '-'}</span></p>
                      <p>Card Number: <span className="text-text-primary">{pm?.last4 ? `******${pm.last4}` : '-'}</span></p>
                    </>
                  )}
                  {pmType === 'card' && (
                    <>
                      <p>Brand: <span className="text-text-primary">{pm?.brand || '-'}</span></p>
                      <p>Card Number: <span className="text-text-primary">{pm?.last4 ? `******${pm.last4}` : '-'}</span></p>
                    </>
                  )}
                  {pmType === 'cash' && (
                    <p>Method: <span className="text-text-primary">Cash</span></p>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
