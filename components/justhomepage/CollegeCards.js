import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/effect-cards";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { EffectCards } from "swiper/modules";
import { register } from "swiper/element/bundle";
import CollegeCard from "./CollegeCard";

register();

const colleges = [
  {
    firstname: "IIT",
    lastname: "KANPUR",
    live: false,
  },
  {
    firstname: "PSIT",
    lastname: "KANPUR",
    live: false,
  },
  {
    firstname: "HBTU",
    lastname: "KANPUR",
    live: true,
  },
  {
    firstname: "CSA",
    lastname: "KANPUR",
    live: false,
  },
  {
    firstname: "CSJMU",
    lastname: "KANPUR",
    live: false,
  },
];

const CollegeCards = () => {
  return (
    <div style={{ width: "100%", display: "flex", justifyContent: "center"}}>
      <Swiper
        style={{
          height: "auto", // Corrected the typo
          width: "100%",
          margin: "auto",
        }}
        cardsEffect={{ slideShadows: false, rotate: false, perSlideOffset:12 }}
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
            <CollegeCard firstname={college.firstname} lastname={college.lastname} live={college.live} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default CollegeCards;
