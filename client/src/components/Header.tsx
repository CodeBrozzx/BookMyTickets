import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Header() {
  return (
    <header className="bg-card shadow-md py-4">
      <div className="container mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center">
          <Link href="/">
            <h1 className="text-2xl font-bold font-heading text-primary cursor-pointer">MovieTix</h1>
          </Link>
        </div>
        <nav>
          <ul className="flex space-x-6">
            <li><Link href="/"><a className="hover:text-primary">Movies</a></Link></li>
            <li><a href="#" className="hover:text-primary">Theaters</a></li>
            <li><a href="#" className="hover:text-primary">My Bookings</a></li>
          </ul>
        </nav>
        <div>
          <Button>Sign In</Button>
        </div>
      </div>
    </header>
  );
}
