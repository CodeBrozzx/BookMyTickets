import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-card py-8 mt-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between">
          <div className="mb-6 md:mb-0">
            <h3 className="text-xl font-heading font-bold text-primary mb-4">MovieTix</h3>
            <p className="text-muted-foreground max-w-md">
              Book movie tickets for the latest movies running in theaters in your city.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <h4 className="font-heading font-semibold mb-4">Movies</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link href="/"><a className="hover:text-primary">Now Showing</a></Link></li>
                <li><a href="#" className="hover:text-primary">Coming Soon</a></li>
                <li><a href="#" className="hover:text-primary">Cinemas</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-heading font-semibold mb-4">Help</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-primary">About Us</a></li>
                <li><a href="#" className="hover:text-primary">Contact Us</a></li>
                <li><a href="#" className="hover:text-primary">Terms of Use</a></li>
                <li><a href="#" className="hover:text-primary">Privacy Policy</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-heading font-semibold mb-4">My Account</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-primary">My Tickets</a></li>
                <li><a href="#" className="hover:text-primary">Transaction History</a></li>
                <li><a href="#" className="hover:text-primary">Preferences</a></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-accent text-center text-muted-foreground text-sm">
          <p>&copy; {new Date().getFullYear()} MovieTix. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
