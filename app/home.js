"use client";

import { useRouter } from "next/navigation";
import Navbar from "./components/Navbar";

const services = [
  {
    title: "Strategy Consulting",
    description:
      "Transform your business with data-driven strategies and actionable insights.",
    color: "#1e5ba8",
  },
  {
    title: "Digital Transformation",
    description:
      "Navigate the digital landscape with cutting-edge technology solutions.",
    color: "#d4af37",
  },
  {
    title: "Operational Excellence",
    description:
      "Optimize processes and maximize efficiency across your organization.",
    color: "#808080",
  },
];

const stats = [
  { value: "500+", label: "Clients Served" },
  { value: "98%", label: "Client Satisfaction" },
  { value: "25+", label: "Years Experience" },
  { value: "150+", label: "Expert Consultants" },
];

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <section className="bg-gradient-to-br from-[#1e5ba8] to-[#0f3d7a] py-24 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="mb-6 text-5xl font-semibold tracking-tight">
              Strategic Consulting for Modern Business
            </h1>
            <p className="mx-auto mb-8 max-w-3xl text-xl text-blue-100">
              TriMerge Consulting Group delivers comprehensive solutions that
              drive innovation, efficiency, and sustainable growth for
              organizations worldwide.
            </p>
            <div className="flex justify-center gap-4">
              <button
                type="button"
                onClick={() => router.push("/search")}
                className="rounded-md bg-[#d4af37] px-8 py-3 font-semibold text-gray-900 transition-colors hover:bg-[#c19b28]"
              >
                Get Started
              </button>
              <button
                type="button"
                onClick={() => router.push("/admin")}
                className="rounded-md border border-white/30 px-8 py-3 font-semibold text-white transition-colors hover:bg-white/10"
              >
                Admin Access
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl text-gray-900">Our Services</h2>
            <p className="text-xl text-gray-600">
              Tailored solutions to meet your organization&apos;s unique needs
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {services.map((service) => (
              <div
                key={service.title}
                className="rounded-lg border border-gray-200 bg-white p-8 transition-shadow hover:shadow-xl"
              >
                <div
                  className="mb-6 flex h-16 w-16 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${service.color}15` }}
                >
                  <div
                    className="h-8 w-8 rounded"
                    style={{ backgroundColor: service.color }}
                  />
                </div>
                <h3 className="mb-4 text-2xl text-gray-900">{service.title}</h3>
                <p className="text-gray-600">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 text-center md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label}>
                <div className="mb-2 text-4xl text-[#1e5ba8]">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-6 text-4xl text-gray-900">
            Ready to Transform Your Business?
          </h2>
          <p className="mb-8 text-xl text-gray-600">
            Let&apos;s discuss how TriMerge Consulting Group can help you
            achieve your strategic goals.
          </p>
          <div className="flex justify-center gap-4">
            <button
              type="button"
              onClick={() => router.push("/chat")}
              className="rounded-md bg-[#1e5ba8] px-8 py-3 font-semibold text-white transition-colors hover:bg-[#0f3d7a]"
            >
              Schedule a Consultation
            </button>
            <button
              type="button"
              onClick={() => router.push("/search")}
              className="rounded-md border-2 border-[#1e5ba8] px-8 py-3 font-semibold text-[#1e5ba8] transition-colors hover:bg-[#1e5ba8] hover:text-white"
            >
              Learn More
            </button>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 py-12 text-gray-400">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between md:flex-row">
            <div className="mb-4 md:mb-0">
              <p>&copy; 2026 TriMerge Consulting Group. All rights reserved.</p>
            </div>
            <div className="flex gap-8">
              <a href="#" className="transition-colors hover:text-white">
                Privacy Policy
              </a>
              <a href="#" className="transition-colors hover:text-white">
                Terms of Service
              </a>
              <a href="#" className="transition-colors hover:text-white">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
