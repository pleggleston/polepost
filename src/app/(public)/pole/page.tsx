import { PoleSwipeFlyer } from '@/components/pole/pole-swipe-flyer';

export default function PolePage() {
  return (
    <section className="fixed inset-0 isolate overflow-hidden">
      <div className="absolute inset-0 bg-[url('/pole-bg.png')] bg-cover bg-center bg-no-repeat" />

      <div className="pointer-events-none absolute left-1/2 top-[48%] w-[67vw] max-w-[344px] -translate-x-1/2 -translate-y-1/2 sm:w-[62vw]">
        <div className="pointer-events-auto aspect-[597/1060] w-full">
          <PoleSwipeFlyer />
        </div>
      </div>
    </section>
  );
}
