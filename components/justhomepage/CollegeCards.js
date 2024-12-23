import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/effect-cards";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { EffectCards } from "swiper/modules";
import { register } from "swiper/element/bundle";
import CollegeCard from "./CollegeCard";
import { useMediaQuery } from "@mui/material";

register();

const colleges = [
  {
    firstname: "IIT",
    lastname: "KANPUR",
    live: false,
    position: 'left',
  },
  {
    firstname: "RGIPT",
    lastname: "Amethi",
    live: false,
    position: 'left',
  },
  {
    firstname: "HBTU",
    lastname: "KANPUR",
    live: true,
    position: 'center',
  },
  {
    firstname: "NIT",
    lastname: "Jalandhar",
    live: false,
    position: 'right',
  },
  {
    firstname: "NIT",
    lastname: "Kurukshetra",
    live: false,
    position: 'right',
  },
];

const CollegeCards = () => {
  const [pso, setPso] = useState(12)
  const islessthan800 = useMediaQuery('(max-width:800px)')
  useEffect(() => {
    if (islessthan800) {
      setPso(20)
    }
  }, [islessthan800])

  return (
    <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
      <Swiper
        style={{
          height: "auto", // Corrected the typo
          width: "100%",
          margin: "auto",
        }}
        cardsEffect={{ slideShadows: false, rotate: false, perSlideOffset: pso }}
        effect="cards"
        modules={[EffectCards]}
        loop={true}
        speed={500}
        simulateTouch={true}
        // autoplay={{ delay: 1500, disableOnInteraction: false }}
        initialSlide={2}
      >
        {colleges.map((college, index) => (
          <SwiperSlide key={index} style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            <CollegeCard firstname={college.firstname} lastname={college.lastname} live={college.live} position={college.position} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default CollegeCards;
