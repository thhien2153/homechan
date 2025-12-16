import React from 'react'
import Hero from '../components/Hero'
import FeatureDestination from '../components/FeatureDestination'
import NewsLetter from '../components/NewsLetter'
import WhyChooseUs from '../components/WhyChooseUs'
import Recommendations from '../pages/Recommendations'

const Home = () => {
  return (
    <>
      <Hero />
      <WhyChooseUs />
      <Recommendations />
      <FeatureDestination />
      <NewsLetter />
    </>
  )
}

export default Home