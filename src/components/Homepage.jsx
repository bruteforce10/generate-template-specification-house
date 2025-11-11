import { Link } from "react-router-dom";
import { Video, Tag, User } from "lucide-react";

const Homepage = () => {
  const generators = [
    {
      id: "property-video",
      title: "Property Spec Video Generator",
      description: "Buat video spesifikasi properti dengan animasi yang menarik. Tampilkan kamar tidur, luas, kamar mandi, dan fitur lainnya dengan berbagai animasi.",
      icon: Video,
      path: "/property-video",
      color: "from-indigo-600 to-purple-600",
      hoverColor: "from-indigo-700 to-purple-700",
    },
    {
      id: "callout-label",
      title: "Callout Label Video Generator",
      description: "Buat video animasi callout label untuk menunjukkan lokasi atau fitur tertentu dengan arrow dan text box yang dapat dikustomisasi.",
      icon: Tag,
      path: "/callout-label",
      color: "from-blue-600 to-cyan-600",
      hoverColor: "from-blue-700 to-cyan-700",
    },
    {
      id: "bumper-out",
      title: "Bumper Out Video Generator",
      description: "Buat video card kontak dengan profil, nama, dan nomor telepon. Perfect untuk ending video dengan informasi kontak agent.",
      icon: User,
      path: "/bumper-out",
      color: "from-green-600 to-emerald-600",
      hoverColor: "from-green-700 to-emerald-700",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16 lg:mb-20">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-4 sm:mb-6">
            Video Generator
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto">
            Pilih generator video yang ingin Anda gunakan untuk membuat konten video yang menarik
          </p>
        </div>

        {/* Generator Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 lg:gap-10 max-w-5xl mx-auto">
          {generators.map((generator) => {
            const IconComponent = generator.icon;
            return (
              <Link
                key={generator.id}
                to={generator.path}
                className="group block"
              >
                <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 lg:p-10 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 h-full flex flex-col">
                  {/* Icon */}
                  <div
                    className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl bg-gradient-to-br ${generator.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <IconComponent className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  </div>

                  {/* Title */}
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4 group-hover:text-indigo-600 transition-colors">
                    {generator.title}
                  </h2>

                  {/* Description */}
                  <p className="text-slate-600 mb-6 flex-grow leading-relaxed">
                    {generator.description}
                  </p>

                  {/* CTA */}
                  <div
                    className={`inline-flex items-center gap-2 text-white font-semibold px-6 py-3 rounded-lg bg-gradient-to-r ${generator.color} hover:${generator.hoverColor} transition-all duration-300 group-hover:gap-4`}
                  >
                    <span>Mulai Generator</span>
                    <svg
                      className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Footer */}
        <div className="text-center mt-12 sm:mt-16 lg:mt-20">
          <p className="text-slate-500 text-sm sm:text-base">
            Pilih salah satu generator di atas untuk mulai membuat video
          </p>
        </div>
      </div>
    </div>
  );
};

export default Homepage;

