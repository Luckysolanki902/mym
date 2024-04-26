import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { register } from "swiper/element/bundle";
import Image from "next/image";
import "swiper/css/effect-cards";
import { EffectCards } from "swiper/modules";
import style from './styles/collegecards.module.css'
// import Card from "./Card";
register();

const teamMembers = [
  {
    NAME: "John Doe",
    Position: "President",
    updatedImageUrl: "/team/JohnDoe.jpg",
  },
  {
    NAME: "Jane Doe",
    Position: "Vice President",
    updatedImageUrl: "/team/JaneDoe.jpg",
  }
]

const CollegeCards = () => {
  const isMultipleImages = teamMembers.length > 1;

  return (
    <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
      <Swiper
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          // backgroundColor: 'black'
        }}
        effect="cards"
        modules={[EffectCards]}
        loop={!isMultipleImages}
        speed={500}
        simulateTouch={true}
        autoplay={{ delay: 1500, disableOnInteraction: false }}
      >
        {teamMembers.map((member, index) => (
          <SwiperSlide key={index}>
            <div className={style.pro}>
              <div className={style.in}>
                <div className={style.proin}>
                  {/* <Image
                    src={`/local_images/imagestsc/${member.updatedImageUrl}`}
                    height={960}
                    width={1280}
                    quality={70}
                    // objectFit="contain"
                    alt={'member'}
                    className={style.proimg}
                  /> */}
                  <div className={style.imgOver}></div>
                </div>
                <div className={`${style.protxt}`}>{member.NAME}</div>
                <div className={style.pos}>{member.Position}</div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default CollegeCards;
