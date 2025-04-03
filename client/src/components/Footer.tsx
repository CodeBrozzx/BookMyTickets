import { Link } from "wouter";
import { Button } from "@/components/ui/button";

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
                <li><Link href="/" className="hover:text-primary">Now Showing</Link></li>
                <li><Button variant="link" className="p-0 hover:text-primary text-muted-foreground">Coming Soon</Button></li>
                <li><Button variant="link" className="p-0 hover:text-primary text-muted-foreground">Cinemas</Button></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-heading font-semibold mb-4">Help</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><Button variant="link" className="p-0 hover:text-primary text-muted-foreground">About Us</Button></li>
                <li><Button variant="link" className="p-0 hover:text-primary text-muted-foreground">Contact Us</Button></li>
                <li><Button variant="link" className="p-0 hover:text-primary text-muted-foreground">Terms of Use</Button></li>
                <li><Button variant="link" className="p-0 hover:text-primary text-muted-foreground">Privacy Policy</Button></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-heading font-semibold mb-4">My Account</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><Button variant="link" className="p-0 hover:text-primary text-muted-foreground">My Tickets</Button></li>
                <li><Button variant="link" className="p-0 hover:text-primary text-muted-foreground">Transaction History</Button></li>
                <li><Button variant="link" className="p-0 hover:text-primary text-muted-foreground">Preferences</Button></li>
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
