
import { Wrench, Zap, Hammer, PaintBucket, Droplets, Laptop, Tv, Shield } from "lucide-react";
import { Card } from "./ui/Card.jsx";
const categories = [
  {
    icon: Wrench,
    title: "Plumbing",
    description: "Pipe repairs, installations, and maintenance",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Zap,
    title: "Electrical",
    description: "Wiring, repairs, and electrical installations",
    color: "from-yellow-500 to-orange-500",
  },
  {
    icon: Hammer,
    title: "Carpentry",
    description: "Furniture making, repairs, and custom woodwork",
    color: "from-amber-600 to-orange-700",
  },
  {
    icon: PaintBucket,
    title: "Painting",
    description: "Interior and exterior painting services",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: Droplets,
    title: "Cleaning",
    description: "Home and office cleaning services",
    color: "from-teal-500 to-emerald-500",
  },
  {
    icon: Laptop,
    title: "IT Services",
    description: "Computer repair and tech support",
    color: "from-indigo-500 to-blue-600",
  },
  {
    icon: Tv,
    title: "Appliance Repair",
    description: "Fix your household appliances",
    color: "from-red-500 to-rose-600",
  },
  {
    icon: Shield,
    title: "Security",
    description: "CCTV installation and security systems",
    color: "from-slate-600 to-gray-700",
  },
];

const ServiceCategories = () => {
  return (
    <section className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold">
            Popular Services
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Browse our wide range of trusted professionals ready to help with your needs
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <Card 
                key={index}
                className="group p-6 hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-2 border-2 hover:border-primary/20"
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">
                  {category.title}
                </h3>
                <p className="text-muted-foreground">
                  {category.description}
                </p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ServiceCategories;