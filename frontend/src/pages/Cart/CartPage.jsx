import React, { useMemo, useState } from 'react';
import { applyVoucher } from '../../services/vouchers';

// Giả sử cart.items = [{ _id, name, category, price, qty }]
function formatVND(n){ return new Intl.NumberFormat('vi-VN',{style:'currency',currency:'VND',maximumFractionDigits:0}).format(n||0); }

export default function CartSummary({ cart }) {
  const [code, setCode] = useState('');
  const [voucher, setVoucher] = useState(null); // { code, discount }
  const [message, setMessage] = useState('');

  const itemsPayload = useMemo(()=>(
    (cart.items || []).map(i => ({
      productId: i._id,
      category: i.category,
      price: i.price,
      qty: i.qty
    }))
  ), [cart.items]);

  const subtotal = useMemo(
    () => (cart.items || []).reduce((s,i)=> s + i.price*i.qty, 0),
    [cart.items]
  );
  const discount = voucher?.discount || 0;
  const total = Math.max(0, subtotal - discount);

  async function onApply() {
    try{
      setMessage('');
      const data = await applyVoucher(code.trim(), itemsPayload);
      setVoucher({ code: data.code, discount: data.discount });
    }catch(e){
      setVoucher(null);
      setMessage(e?.response?.data?.message || 'Không áp dụng được mã');
    }
  }
  function clearVoucher(){
    setVoucher(null);
    setCode('');
    setMessage('');
  }

  return (
    <div className="cart-summary">
      <div className="voucher-row">
        <input
          value={code}
          onChange={e=>setCode(e.target.value.toUpperCase())}
          placeholder="Nhập mã giảm giá"
        />
        {voucher
          ? <button onClick={clearVoucher}>Xoá mã</button>
          : <button onClick={onApply}>Áp dụng</button>}
      </div>
      {message && <p className="text-danger" style={{marginTop:8}}>{message}</p>}
      {voucher && (
        <p className="text-success" style={{marginTop:8}}>
          Đã áp dụng: <b>{voucher.code}</b> (−{formatVND(voucher.discount)})
        </p>
      )}

      <div className="money-lines" style={{marginTop:16}}>
        <div className="line"><span>Tạm tính</span><span>{formatVND(subtotal)}</span></div>
        <div className="line"><span>Voucher</span><span>−{formatVND(discount)}</span></div>
        <div className="line total"><span>Thành tiền</span><span>{formatVND(total)}</span></div>
      </div>
    </div>
  );
}
