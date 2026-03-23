import { Metadata } from 'next';
import { Suspense } from 'react';
import BookingFlow from '@/components/booking/BookingFlow';

export const metadata: Metadata = {
  title: 'Book an Appointment - Gardenias Healthcare',
  description: 'Book your massage therapy appointment online. Choose your service, therapist, and preferred time. Easy online scheduling at Gardenias Healthcare in Milton, ON.',
  keywords: 'book appointment, massage therapy booking, schedule massage, Gardenias Healthcare Milton',
};

export default function BookPage() {
  return (
    <Suspense fallback={null}>
      <BookingFlow />
    </Suspense>
  );
}
