'use client';
import { useCart, Item } from './Cart';
export default function AddButton({ items, label, className='btn' }: { items: Item[]; label: string; className?: string }) {
  const { add } = useCart(); return <button className={className} onClick={() => items.forEach(i => add(i))}>{label}</button>;
}
