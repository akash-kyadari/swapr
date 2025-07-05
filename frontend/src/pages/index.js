import Head from "next/head";
import { Geist, Geist_Mono } from "next/font/google";
import { 
  UserGroupIcon, 
  SparklesIcon, 
  RocketLaunchIcon, 
  ShieldCheckIcon,
  StarIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import Button from '../components/Button';
import Card from '../components/Card';
import useUserStore from '../store/useUserStore';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Home() {
  const { user } = useUserStore();
  const features = [
    {
      icon: UserGroupIcon,
      title: 'Connect with Experts',
      description: 'Find talented professionals in your field and build meaningful connections.',
      color: 'from-blue-500 to-indigo-500'
    },
    {
      icon: SparklesIcon,
      title: 'Skill Exchange',
      description: 'Trade your expertise for new skills. Learn from others while teaching.',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: RocketLaunchIcon,
      title: 'Accelerate Growth',
      description: 'Fast-track your career by learning from industry experts.',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Trusted Community',
      description: 'Verified profiles and reviews ensure quality connections.',
      color: 'from-orange-500 to-red-500'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'UX Designer',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      content: 'SkillSwap helped me learn advanced prototyping while teaching others about design systems.',
      rating: 5
    },
    {
      name: 'Marcus Rodriguez',
      role: 'Full Stack Developer',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      content: 'I traded my React skills for Python expertise. The community is incredibly supportive.',
      rating: 5
    },
    {
      name: 'Emma Thompson',
      role: 'Product Manager',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      content: 'Found my mentor through SkillSwap. Now I\'m leading product strategy at a startup.',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center py-12 px-2 sm:px-6">
      <Head>
        <title>SkillSwap</title>
      </Head>

      {/* Hero Section */}
      <section className="text-center space-y-8">
        <div className="space-y-6">
          <h1 className="text-5xl md:text-7xl font-bold">
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Swap Skills,
            </span>
            <br />
            <span className="text-slate-900">Build Connections</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Connect with talented professionals, exchange expertise, and accelerate your growth. 
            Join thousands of learners and teachers in the most innovative skill-sharing platform.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-6">
          {!user ? (
            <>
              <Button size="xl" className="w-full sm:w-auto font-semibold shadow-md" as="a" href="/marketplace">
                Browse Marketplace
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </Button>
              <Button size="xl" className="w-full sm:w-auto font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md hover:from-blue-700 hover:to-indigo-700" as="a" href="/auth/register">
                Get Started
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </Button>
              <Button variant="outline" size="xl" className="w-full sm:w-auto font-semibold border-blue-600 text-blue-600 hover:bg-blue-50 shadow-sm" as="a" href="/auth/login">
                Sign In
              </Button>
            </>
          ) : (
            <>
              <Button size="xl" className="w-full sm:w-auto font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md hover:from-blue-700 hover:to-indigo-700" as="a" href="/skills">
                Browse Skills
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </Button>
              <Button variant="outline" size="xl" className="w-full sm:w-auto font-semibold border-blue-600 text-blue-600 hover:bg-blue-50 shadow-sm" as="a" href="/dashboard">
                Go to Dashboard
              </Button>
            </>
          )}
        </div>

        <div className="flex items-center justify-center space-x-8 text-sm text-slate-500">
          <div className="flex items-center">
            <StarIcon className="w-5 h-5 text-yellow-400 mr-1" />
            <span>4.9/5 from 2,000+ reviews</span>
          </div>
          <div>•</div>
          <div>10,000+ skills exchanged</div>
          <div>•</div>
          <div>50,000+ members</div>
        </div>
      </section>

      {/* Features Section */}
      <section className="space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
            Why Choose SkillSwap?
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Our platform is designed to make skill exchange seamless, trustworthy, and rewarding.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card key={index} hover className="text-center space-y-4">
              <div className={`inline-flex p-3 rounded-2xl bg-gradient-to-r ${feature.color}`}>
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900">{feature.title}</h3>
              <p className="text-slate-600 leading-relaxed">{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
            What Our Members Say
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Join thousands of satisfied members who have transformed their careers through skill exchange.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} variant="elevated" className="space-y-4">
              <div className="flex items-center space-x-4">
                <img 
                  src={testimonial.avatar} 
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-semibold text-slate-900">{testimonial.name}</h4>
                  <p className="text-sm text-slate-500">{testimonial.role}</p>
                </div>
              </div>
              <p className="text-slate-600 leading-relaxed">"{testimonial.content}"</p>
              <div className="flex items-center">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <StarIcon key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center">
        <Card variant="gradient" className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
              Ready to Start Your Journey?
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Join SkillSwap today and discover a world of opportunities to learn, teach, and grow.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="w-full sm:w-auto" as="a" href="/auth/register">
              Create Your Profile
              <ArrowRightIcon className="w-5 h-5 ml-2" />
            </Button>
            <Button variant="outline" size="lg" className="w-full sm:w-auto" as="a" href="/skills">
              Learn More
            </Button>
          </div>
        </Card>
      </section>
    </div>
  );
}
