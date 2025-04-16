import React from "react";

import Navbar from "@/components/ui/Navbar";

function BackendLayout({ children }) {
  return (
    <div>
      
    
      <div className="mx-5 md:mx-20 lg:,mx:36">{children}</div>
    </div>
  );
}

export default BackendLayout;
