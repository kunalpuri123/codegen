import React from "react";
import { AnimatedText } from "../_components/AnimatedText";
import Image from "next/image";
import Kubernetics from "../_roadmaps/kubernetics.png"; // Ensure this path is correct

const Roadmaps = () => {
  return (
    <div className="flex flex-col items-center">
      {/* Animated Text Component */}
      <AnimatedText
        text="Kubernetes"
        textClassName="text-[4rem] md:text-[6rem] font-bold"
      />

      {/* Text below the animated text */}
      <div className="mt-8 text-center text-lg md:text-xl px-4 z-10 text-white">
        <p>
          <strong>Kubernetes Introduction :         </strong> Kubernetes, also known as k8s, is an open-source container orchestration platform that automates the deployment, scaling, and management of containerized applications. It provides a way to abstract the underlying infrastructure and manage applications at scale, while also offering flexibility, portability, and a rich feature set. Kubernetes has become the de facto standard for container orchestration due to its widespread adoption, active community, and ability to handle complex, multi-tiered applications.
        </p>
       
      </div>

      {/* Image in the center below the text */}
      <div className="mt-8 z-10 relative">
      <Image
        src={Kubernetics}
        alt="Backend Image"
        useMap="#image-map"
        width={1200}
        height={800}
        layout="intrinsic"
      />
      {/* Image Map Generated by http://www.image-map.net/ */}
      
    </div>
  
    </div>
  );
};

export default Roadmaps;
