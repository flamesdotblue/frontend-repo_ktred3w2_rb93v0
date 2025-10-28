import React from 'react';
import Spline from '@splinetool/react-spline';

export default function Hero3D({ onGetStarted, onOpenAuth, user }) {
  return (
    <section className="relative h-[520px] w-full overflow-hidden">
      <div className="absolute inset-0">
        <Spline scene="https://prod.spline.design/qQUip0dJPqrrPryE/scene.splinecode" style={{ width: '100%', height: '100%' }} />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/90 via-white/70 to-white" />

      <div className="relative z-10 mx-auto flex h-full max-w-6xl items-center px-4">
        <div className="max-w-xl">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
            Smarter taxes. Transparent impact.
          </h1>
          <p className="mt-3 text-slate-600">
            Estimate your taxes, choose how your contribution is allocated, and track verified utilization with receipts.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={onGetStarted}
              className="pointer-events-auto inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow hover:bg-slate-800"
            >
              Start Allocation
            </button>
            {!user && (
              <button
                onClick={onOpenAuth}
                className="pointer-events-auto inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Sign in
              </button>
            )}
          </div>
          <div className="mt-4 text-xs text-slate-500">
            The 3D identity card above symbolizes verified profiles and compliant payments.
          </div>
        </div>
      </div>
    </section>
  );
}
