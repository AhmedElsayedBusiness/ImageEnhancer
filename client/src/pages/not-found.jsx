import { Link } from "wouter";
import Sidebar from "../components/layout/Sidebar";
import MainContent from "../components/layout/MainContent";

const NotFound = () => {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-background-dark text-text-primary">
      <Sidebar />
      
      <MainContent 
        title="Page Not Found" 
        description="The page you are looking for does not exist"
      >
        <div className="bg-background-card rounded-xl p-8 text-center">
          <span className="material-icons text-5xl text-text-muted mb-4">error_outline</span>
          <h3 className="text-xl font-medium mb-2">404 - Page Not Found</h3>
          <p className="text-text-secondary mb-4">The page you are looking for might have been removed or is temporarily unavailable.</p>
          <Link href="/" className="btn btn-primary">
            <span className="material-icons text-sm mr-1">home</span> Go to Home
          </Link>
        </div>
      </MainContent>
    </div>
  );
};

export default NotFound; 