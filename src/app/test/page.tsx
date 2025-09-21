import { generateCourseFromTag } from '@/lib/generateCourse';
import React from 'react'

const page = async () => {

  const course = await generateCourseFromTag("react");
  console.log(course);

  return (
    <div>
      Hello
    </div>
  )
}

export default page