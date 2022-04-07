const controller_id = 2232
const block_number = 423

let light_color_safe = true
let light_color_caution = false;

let light_color = 'Green'
let maintenance = false
let operational = true
let occupancy = false

let crossing = false
let track_switch = false

const suggested_authority = 0
const suggested_speed = 0

const commanded_authority = 0
const commanded_speed = 0

// accessor functions
export function get_light_color_safe () {
  return light_color_safe
}
export function get_light_color_caution () {
  return light_color_safe_caution
}

export function get_maintenance () {
  return maintenance
}

export function get_operational () {
  return operational
}

export function get_occupancy () {
  return occupancy
}

export function get_crossing () {
  return crossing
}

export function get_track_switch () {
  return track_switch
}

export function get_commanded_speed () {
  return commanded_speed
}

export function get_commanded_authority () {
  return commanded_authority
}

// UI functions

export function toggle_maintenance () {
  maintenance = !maintenance
  return maintenance
}

export function toggle_block_occupancy () {
    occupancy = !occupancy
    return occupancy
}

export function toggle_block_operational () {
    operational = !operational
    return operational
}


export function toggle_track_switch () {
  track_switch = !track_switch
  console.log(track_switch)
  return track_switch
}

export function toggle_crossing () {
  crossing = !crossing
  console.log(crossing)
  return crossing
}

export function toggle_light () {
  if (light_color == 'GREEN') 
  {
    light_color = 'YELLOW'
    console.log(light_color)
    return light_color
  } 
  else if (light_color == 'YELLOW') 
  {
    light_color = 'RED'
    console.log(light_color)
    return light_color
  } 
  else {
    light_color = 'GREEN'
    console.log(light_color)
    return light_color
  }
}
