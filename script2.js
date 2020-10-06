/* global keyCode, UP_ARROW, LEFT_ARROW, RIGHT_ARROW, DOWN_ARROW, 
collideRectCircle, collideCircleCircle, collideLineCircle, random, mouseIsPressed, 
clear, textSize, createCanvas, strokeWeight, rect, background, colorMode, 
HSB, noStroke, backgroundColor, color, fill, ellipse, text, stroke, 
line, width, height, mouseX, mouseY, windowWidth, windowHeight, createCheckbox,
textAlign, RIGHT, CENTER, keyIsPressed, collideCircleCircle, abs, textFont, key, dist
noFill, PolySynth, height, loadImage, image,0, rectMode, round, p5, userStartAudio, CORNER, 
RGB, createSlider */

//array of notes that the user places
let notes = []; 

/*all arrays that store position of treble clef notes and pitches and bass clef notes and pitches. 
helpful for determing the pitch at a certain position. For exmaple, the pitch at the position treblePositions[i] should be 
treblePitches[i]. Right now, the treblePitches and bassPitches arrays are wrong because they shouldn't include accidentals (sharps or flats)
we'll have to find a way to work around accidentals
*/
let treblePositions, bassPositions, treblePitches, bassPitches, allPitches; 

/*increment: space between two lines on the staff
trebleCenter: y value of third line of the top staff
bassCenter: y value of third line of bass staff
ty0: y value of the highest possible note users can put (C6) 
by0: y value of the lowest possible note users can put (C2) */
let increment, trebleCenter, bassCenter, ty0, by0, lineX; 

/* all booleans
position isn't used right now and probably doesn't need to be. It's to check the x-position of a note for the sake of rhythm. 
but the p5.sound polySynth library already covers note duration, so I think it's okay as long as we store notes in arrays (one array for treble clef, another array for bass clef)

pitch checks if a note is placed on a line or space. in-betweens are bad and will set pitch to false. right now if pitch is false, the background turns red; 

proximity checks if a note is on the staff. only when pitch and and position are both true does the background turn green.
*/
let currentAccidentalSetting;

//creates (draws) staff, notes menu, time signature menu, sharps and flats menu 
let staff, noteMenu, timeSignatureMenu, accidentalMenu;

//variables for color
let greenBackgroundColor, redBackgroundColor;

//images
let trebleClef, bassClef, sharpImage, flatImage, checkmark, checkmarkX, checkmarkY, checkmark2, checkmark2X;
let checkmark2Y, checkmark3, checkmark3X, checkmark3Y, playBtn, playBtnX, playBtnY, undo, undoX, undoY, helpIcon, xOutIcon, timeSig44, timeSig34;

//object in the p5.sound library that plays notes
let polySynth;

let playing = false;
let lineLocation = 0;

//sets the possible x- and y- positions of notes on the staff such that they fit on lines or spaces and correspond to rhythm
let yPositionOnStaff, x44PositionOnStaff, x34PositionOnStaff;

let help = false;

//tempoSlider is a slider bar that controls tempoMultiplier. The bigger tempoMultiplier is, the faster the tempo—the red line moves faster, and the note durations are shorter
let tempoSlider, tempoMultiplier;

let timeSignature = 4;

//current value of note that's being placed on the staff. Changes depending on menu selection
let value = "quarter"; //"quarter" is default value; subject to change


function setup() {
  
 
  createCanvas(1450, 650);
  colorMode(HSB, 360, 100, 100);
  
  //loading various images
  trebleClef = loadImage("https://cdn.glitch.com/95b4cfa8-d332-40a2-9d6f-ac577791e08f%2Ftreble%20clef.png?v=1595732292150");
  bassClef = loadImage("https://cdn.glitch.com/95b4cfa8-d332-40a2-9d6f-ac577791e08f%2Fbass%20clef.png?v=1595732289741");
  sharpImage = loadImage("https://cdn.glitch.com/95b4cfa8-d332-40a2-9d6f-ac577791e08f%2Fsharp2.webp?v=1595881682214");
  flatImage = loadImage("https://cdn.glitch.com/95b4cfa8-d332-40a2-9d6f-ac577791e08f%2Fflat1.webp?v=1595881666051");
  checkmark = loadImage("https://cdn.glitch.com/95b4cfa8-d332-40a2-9d6f-ac577791e08f%2Fgreen%20checkmark.png?v=1595915662781");
  checkmark2 = loadImage("https://cdn.glitch.com/95b4cfa8-d332-40a2-9d6f-ac577791e08f%2Fgreen%20checkmark.png?v=1595915662781");
  checkmark3 = loadImage("https://cdn.glitch.com/95b4cfa8-d332-40a2-9d6f-ac577791e08f%2Fgreen%20checkmark.png?v=1595915662781");
  playBtn = loadImage("https://cdn.glitch.com/95b4cfa8-d332-40a2-9d6f-ac577791e08f%2Fdf8d8b4c-1441-4c59-a14a-cfba859f6d05.image.png?v=1595964131151");
  undo = loadImage("https://cdn.glitch.com/95b4cfa8-d332-40a2-9d6f-ac577791e08f%2Fundo-button.png?v=1596010347134");
  helpIcon = loadImage("https://cdn.glitch.com/88d6ffc3-edbd-4c86-ab31-db766adaf968%2Fhelp%20icon.png?v=1596141866664");
  xOutIcon = loadImage("https://cdn.glitch.com/88d6ffc3-edbd-4c86-ab31-db766adaf968%2Fx%20out%20icon%20WHITE.png?v=1596144165372");
  timeSig44 = loadImage("https://cdn.glitch.com/88d6ffc3-edbd-4c86-ab31-db766adaf968%2F44%20time%20signature.png?v=1596166859784");
  timeSig34 = loadImage("https://cdn.glitch.com/88d6ffc3-edbd-4c86-ab31-db766adaf968%2F34%20time%20signature.png?v=1596166431595");
  
  //creating instances of Staff, NoteMenu, and AccidentalMenu staffs
  staff = new Staff();
  noteMenu = new NoteMenu();
  accidentalMenu = new AccidentalMenu();
  
  //again, increment = space between lines; trebleCenter = y-position of center line on top staff, bassCenter = y-position of center line of bottom staff
  increment = 25;
  trebleCenter = height * 0.3;
  bassCenter = trebleCenter + 10 * increment;
  
  /*ty0 = treblePositions[0], aka the y-position of highest possible note that can be placed on top staff (C6)
  by0 = bassPositions[0], aka the y-position of highest possible note that can be placed on bottom staff (C4) */
  ty0 = trebleCenter - 4 * increment;
  by0 = bassCenter - 3 * increment;
  
  //initializing various variables as empty arrays
  //arrays containing y-positions of every possible pitch on the staff, going down one pitch at a time
  treblePositions = [];
  bassPositions = [];
  
  /*array containing every possible NON-ACCIDENTAL pitch on the staff, going down one pitch at a time.
  IMPORTANT CONECPT: (without regarding accidentals), a note at treblePositions[i] has the pitch treblePitches[i].
  same for bassPitches*/
  treblePitches = [];
  bassPitches = [];
  
  //array that contains all pitches from high to low, INCLUDING accidentals. Iterated through whenever accidentals are selected on the Accidental Menu to change a natural note to a sharp or flat note
  allPitches = [];
  
  //empty array for added notes to be stored
  notes = [];
  
  //pushes y-position values into treblePositions and bassPositions arrays
  setPositionArrays();
  //pushes pitch string values into treblePitches and bassPitches arrays
  setPitchArrays();
  
  //green check marks that apprear next to user's selection in note menu and accidental menu
  checkmarkX = noteMenu.xCenter + 20;
  checkmarkY = noteMenu.quarterNotePosition + increment * 1.5;
  checkmark2X = accidentalMenu.xCenter + 30;
  checkmark2Y = accidentalMenu.nonePosition;
  checkmark3X = accidentalMenu.position44X + increment / 3;
  checkmark3Y = accidentalMenu.timeSignatureY + increment + 40;
  
  //slider adjusts tempo, specifically, the tempoMultiplier variable
  tempoSlider = createSlider(0.5, 3, 1.2, 0.1);
  tempoSlider.position(staff.x2 + 25, height / 4 + 230);
   
  //default value of tempoMultiplier. This setting creates a slow-to-moderate tempo when music is played
  tempoMultiplier = 1;
  
  //play button positions
  playBtnX = width / 2 - 100;
  playBtnY = height - 90;
  
  //undo button positions
  undoX = width / 2 - 170;
  undoY = height - 60;
  
  //initial accidental setting is natural
  currentAccidentalSetting = "natural";
  
  //sound library that allows multiple notes to be played at the same time
  polySynth = new p5.PolySynth();
  
}

function draw() {
  //starts the playing of sound
  userStartAudio();
  
  //light gray background
  background(95);
  
  //calls draw() method in Staff class, which draws a staff to the canvas
  staff.draw();
  //calls draw() method in NoteMenu class, which draws the notes menu to the canvas
  noteMenu.draw();
  //calls draw() method in AccidentalMenu class, which draws the notes menu to the canvas
  accidentalMenu.draw();
  
  //notes menu text
  noStroke();
  textSize(15);
  textAlign(RIGHT, CENTER);
  text("Quarter:", noteMenu.xCenter - 30, noteMenu.quarterNotePosition);
  text("Half:", noteMenu.xCenter - 30, noteMenu.halfNotePosition);
  text("Dotted \nHalf:", noteMenu.xCenter - 30, noteMenu.dottedHalfNotePosition);
  text("Whole:", noteMenu.xCenter - 30, noteMenu.wholeNotePosition);
  
  //title text
  textSize(45);
  textAlign(CENTER);
  textFont("Roboto");
  text("Cantabile!", width / 2, 40);
  textSize(20);
  textFont("Garamond");
  text("Music Notation Software", width / 2, 70);
    
  //noStroke();
  textSize(20);
  //textAlign(CENTER);
  text("Note Values", noteMenu.xCenter - 20, height / 5);
  
  
  //iterating through the entire notes array, checking when the moving red line hits a note and playing whichever note(s) the red line hits at any given moment
  for (let i  = 0; i < notes.length; i++) {
    //notes[i].getPitch();
    notes[i].draw();
    //booleans
    let trebleHit = collideLineCircle(staff.x1 - increment + lineLocation, treblePositions[0], staff.x1 - increment + lineLocation, treblePositions[14], notes[i].x,notes[i].y,increment-5);
    let bassHit = collideLineCircle(staff.x1 - increment + lineLocation, bassPositions[0], staff.x1 - increment + lineLocation, bassPositions[14], notes[i].x,notes[i].y,increment-5);
    
    //the || operator allows for notes in both clefs to be played at the same time
    if (trebleHit || bassHit){
      console.log("hit")
      notes[i].playNote();
    }
    
  }
  
  //displays the following images: checkmarks, play button, undo button, and helpIcon
  image(checkmark, checkmarkX, checkmarkY, 15, 15);
  image(checkmark2, checkmark2X, checkmark2Y, 15, 15);
  image(checkmark3, checkmark3X, checkmark3Y, 15, 15);
  image(playBtn, playBtnX, playBtnY, 200, 100);
  image(undo, undoX, undoY + 6, 30, 30);
  image(helpIcon, width / 2  + 135, undoY, 40 ,40);
  

  
  if (playing) {
    //draws the moving red line
    stroke('red');
    line(staff.x1 - increment + lineLocation, ty0 - increment * 5.5, staff.x1 - increment + lineLocation, by0 - increment * 2.5);
    //moves the red line to the right continuously
    lineLocation += 1.35 * tempoMultiplier;
    
    //moving red line disappears when "song is over"
    if (staff.x1 - increment + lineLocation >= staff.x2) {
      playing = false;
    }  
  }
  
  //rounds mouse position so notes appear in designated locations (either on the line or in between lines) with maximum of 4 notes per measure
  yPositionOnStaff = round(mouseY/(increment/2))*(increment/2)-5;
  x44PositionOnStaff = round(mouseX/((staff.x2 - staff.x1) / 16)) * ((staff.x2 - staff.x1) / 16) + 22;
  x34PositionOnStaff = round(mouseX/((staff.x2 - staff.x1) / 12)) * ((staff.x2 - staff.x1) / 12) + 43;
  
  //changes tempoMultiplier depending on tempoSlider's value  
  tempoMultiplier = tempoSlider.value();
  
  //alllows for display of help menu 
  if (help) {
    showHelp();
  }
  textFont("Garamond");
}

//multipurpose function, to say the least. Performing versatile functions depending on mouse's position when mouse is clicked
function mousePressed() {
  /*changes accidental setting (variable currentAccidentalSetting) when mouse is in vicinity of the accidental menu
  also changes the position of the green check mark to reflect which accidental setting is selected */
  if (mouseX > staff.x2 && mouseY < accidentalMenu.timeSignatureY) {
    if (
      mouseY >= accidentalMenu.sharpPosition &&
      mouseY <= accidentalMenu.sharpPosition + increment
    ) {
      checkmark2Y = accidentalMenu.sharpPosition;
      currentAccidentalSetting = "sharp";
    } else if (
      mouseY >= accidentalMenu.flatPosition &&
      mouseY <= accidentalMenu.flatPosition + increment
    ) {
      checkmark2Y = accidentalMenu.flatPosition;
      currentAccidentalSetting = "flat";
    } else if (
      mouseY >= accidentalMenu.nonePosition &&
      mouseY <= accidentalMenu.nonePosition + increment
    ) {
      checkmark2Y = accidentalMenu.nonePosition;
      currentAccidentalSetting = "natural";
    }
  }
  if (mouseX > staff.x2 && mouseY >= accidentalMenu.timeSignatureY - 5) {
    if (mouseX >= accidentalMenu.position34X && mouseX <= accidentalMenu.position34X + increment) {
      checkmark3X = accidentalMenu.position34X + increment / 3;
      timeSignature = 3;
    }
    else if (mouseX >= accidentalMenu.position44X && mouseX <= accidentalMenu.position44X + increment) {
      checkmark3X = accidentalMenu.position44X + increment / 3;
      timeSignature = 4;
    }
  }
  //stamps notes only when mouse is within the 4 bars
  if (mouseX > staff.x1 - increment && mouseX < staff.x2) {
    if (mouseY >= treblePositions[0] && mouseY <= treblePositions[14]) {
      if (timeSignature === 4) {
        notes.push(
          new Note(
            x44PositionOnStaff,
            yPositionOnStaff,
            value,
            currentAccidentalSetting
          )
        );
        console.log(notes);
      } else if (timeSignature === 3) {
        notes.push(
          new Note(
            x34PositionOnStaff,
            yPositionOnStaff,
            value,
            currentAccidentalSetting
          )
        );
      }
    }
    if (mouseY >= bassPositions[0] && mouseY <= bassPositions[14]) {
      if (timeSignature === 4) {
        notes.push(
          new Note(
            x44PositionOnStaff,
            yPositionOnStaff,
            value,
            currentAccidentalSetting
          )
        );
        console.log(notes);
      } else if (timeSignature === 3) {
        notes.push(
          new Note(
            x34PositionOnStaff,
            yPositionOnStaff,
            value,
            currentAccidentalSetting
          )
        );
      }
    }
    //activates the moving line function to play melody
    if (
      mouseX >= playBtnX + 10 &&
      mouseX <= playBtnX + 190 &&
      mouseY >= height - 75 &&
      mouseY <= height - 10
    ) {
      movingLine();
    }
    //if "undo" button is clicked, the last note that the user placed is removed from the notes array and from the canvas
    if (
      mouseX >= undoX &&
      mouseX <= undoX + 30 &&
      mouseY >= undoY + 6 &&
      mouseY <= undoY + 30
    ) {
      notes.pop();
    } //if the "help" button is clicked, help becomes true, and the help menu appears
    if (
      mouseX >= width / 2 + 135 &&
      mouseX <= width / 2 + 135 + 40 &&
      mouseY >= undoY &&
      mouseY <= undoY + 40
    ) {
      help = true;
    }
    //if the help menu is currently open, and the user clicks the "X" button, the help menu disappears
    if (
      help &&
      mouseX >= width / 2 + (height - 200) / 2 - 30 &&
      mouseX <= width / 2 + (height - 200) / 2 - 10 &&
      mouseY >= height / 2 - (height - 200) / 2 - 25 &&
      mouseY <= height / 2 - (height - 200) / 2 - 5
    ) {
      help = false;
      console.log(help);
    }
    //changes the note value and the position of the green check mark in notes menu
  } else if (mouseX < staff.x1 - increment) {
    if (
      mouseY >= noteMenu.quarterNotePosition - 10 &&
      mouseY <= noteMenu.quarterNotePosition + increment * 3
    ) {
      value = "quarter";
      checkmarkY = noteMenu.quarterNotePosition + increment * 1.5;
    } else if (
      mouseY >= noteMenu.halfNotePosition - 10 &&
      mouseY <= noteMenu.halfNotePosition + increment * 3
    ) {
      value = "half";
      checkmarkY = noteMenu.halfNotePosition + increment * 1.5;
    } else if (
      mouseY >= noteMenu.dottedHalfNotePosition - 10 &&
      mouseY <= noteMenu.dottedHalfNotePosition + increment * 3
    ) {
      value = "dotted half";
      checkmarkY = noteMenu.dottedHalfNotePosition + increment * 1.5;
    } else if (
      mouseY >= noteMenu.wholeNotePosition - 10 &&
      mouseY <= noteMenu.wholeNotePosition + increment * 3
    ) {
      value = "whole";
      checkmarkY = noteMenu.wholeNotePosition;
    }
  }
  //for debugging purposes
  console.log("Current Accidental Setting: ", currentAccidentalSetting);
}

//gets the red line moving
function movingLine() {
  playing = true;
  lineLocation = 0;
}

//sets the treblePositions and bassPositions arrays
function setPositionArrays() {
  
  for (let i = 0; i < 15; i++) {
      treblePositions.push(ty0);
      ty0 += increment / 2;
      
    }
    
    for (let j = 0; j < 15; j++) {
      bassPositions.push(by0);
      by0 += increment / 2;
    }
  //for debugging purposes
  console.log(treblePositions);
}



class Staff {
  constructor() {
  
    //to be implemented in the near future if we don't finish by July 31 :,)
    this.timeSignature = []; //array of two ints
    
    //x position of left vertical line of staff
    this.x1 = width * 1/8;
    
    //x position of right vertical line of staff
    this.x2 = width * 6/7;
    
  }
  draw() {
  
    stroke(0);
    strokeWeight(2.5);

    //draws rows of staff
    for (let i = 0; i < 5; i++) {
      line(
        this.x1 - increment * 1.5,
        treblePositions[2 * i + 4],
        this.x2 + 7,
        treblePositions[2 * i + 4]
      );
      line(
        this.x1 - increment * 1.5,
        bassPositions[2 * i + 2],
        this.x2 + 7,
        bassPositions[2 * i + 2]
      );
    }
    
    //draws clefs
    image(
      trebleClef,
      staff.x1 - increment * 3,
      ty0 - increment * 6,
      increment * 5.2,
      increment * 5.6
    );
    image(
      bassClef,
      staff.x1 - increment * 1.8,
      ty0 + increment * 4.3,
      increment * 3.5,
      increment * 4
    
    ); 
    
    //draws bar lines on staff. 4 measures in total
    line(staff.x1 + (staff.x2 - staff.x1) / 4 , ty0 - increment * 5.5, staff.x1 + (staff.x2 - staff.x1) / 4 , by0 - increment * 2.5);
    line(staff.x1 + (staff.x2 - staff.x1) / 2 , ty0 - increment * 5.5, staff.x1 + (staff.x2 - staff.x1) / 2 , by0 - increment * 2.5);
    line(staff.x1 + 3 * (staff.x2 - staff.x1) / 4 , ty0 - increment * 5.5, staff.x1 + (staff.x2 - staff.x1) * 3/ 4 , by0 - increment * 2.5);
    
    //draws vertical lines on beginning and end of staff 
    line(staff.x1 - increment * 1.5, ty0 - increment * 5.5, staff.x1 - increment * 1.5, by0 - increment * 2.5);
    line(staff.x2, ty0 - increment * 5.5, staff.x2, by0 - increment * 2.5);
    strokeWeight(4);
    line(staff.x2 + 7, ty0 - increment * 5.5, staff.x2 + 7, by0 - increment * 2.5);
    
  }
  
}

class NoteMenu {
  //to the left of the staff, to have user choose the note value they want to have
  constructor() {
    
    //noStroke();
    
    //x value of center of the note menu
    this.xCenter = width * 1/12 - 20;
    
    //y position of the quarter note that appears on the menu
    this.quarterNotePosition = height / 4;
    
    //y position of the half note that appears on the menu
    this.halfNotePosition = height / 4 + 120;
    
    //etc.    
    this.dottedHalfNotePosition = height / 4 + 240;
    
    this.wholeNotePosition = height / 4 + 360;
    
    //length of note head ellipse
    this.length = 1.5 * increment;
    
    //height of note haed ellipse 
    this.height = increment - 5;
  }
  draw() {
    //prints text
    noStroke();
    textSize(20);
    textAlign(CENTER);
    text("Note Values", this.xCenter - 20, height / 5);
    
    textSize(15);
    textAlign(RIGHT, CENTER);
    text("Quarter:", this.xCenter - 30, this.quarterNotePosition);
    text("Half:", this.xCenter - 30, this.halfNotePosition);
    text("Dotted \nHalf:", this.xCenter - 30, this.dottedHalfNotePosition);
    text("Whole:", this.xCenter - 30, this.wholeNotePosition);
    
    //quarter note
    strokeWeight(2.5);
    fill(0);
    ellipse(this.xCenter, this.quarterNotePosition, increment * 1.5, increment-5);
    rect(this.xCenter - increment * 3/4, this.quarterNotePosition, 2.5, increment*3);
    
    //half note
    noFill();
    strokeWeight(2.5);
    stroke(0);
    ellipse(this.xCenter, this.halfNotePosition, increment * 1.5, increment-5);
    fill(0);
    rect(this.xCenter - increment * 3/4, this.halfNotePosition, 0.4, increment*3);
    
    //dotted half note
    noFill();
    strokeWeight(2.5);
    ellipse(this.xCenter, this.dottedHalfNotePosition, increment * 1.5, increment-5);
    fill(0);
    ellipse(this.xCenter + 0.75 * increment + 10, this.dottedHalfNotePosition, 5, 5);
    rect(this.xCenter - increment * 3/4, this.dottedHalfNotePosition, 0.4, increment*3);
    
    //whole note
    noFill();
    strokeWeight(2.5);
    stroke(0);
    ellipse(this.xCenter, this.wholeNotePosition, increment * 1.5, increment-5);
    fill(0);
  }
}
class AccidentalMenu {
  constructor(){
    
    //x value of the center of the accidental menu
    this.xCenter = width * 11/12 + 10;
    //y position of the sharpthat appears on the menu
    this.sharpPosition = height / 4 ;  
    //y position of the flat that appears on the menu
    this.flatPosition = height / 4 + 60;
    //y position of the None that appears on the menu
    this.nonePosition = height / 4 + 120 ;
    
    this.timeSignatureY = height / 4 + 325;
    this.position34X = this.xCenter - 50;
    this.position44X = this.xCenter + 20;
  }
  draw(){
    textSize(20);
    noStroke();
    textAlign(CENTER);
    text("Accidentals", this.xCenter, height / 5);
    text("Tempo", this.xCenter, height / 4 + 180);
    text("Time Signature", this.xCenter, height / 4 + 300);

    textSize(15);
    textAlign(RIGHT, CENTER);
    text("Sharp: ", this.xCenter - 30, this.sharpPosition + increment / 2);
    text("Flat: ", this.xCenter - 30, this.flatPosition + increment / 2);
    text("None", this.xCenter - 30, this.nonePosition + increment / 2);

    //displays sharp and flat on the menu
    image(sharpImage, this.xCenter - 15, this.sharpPosition, increment, increment);
    image(flatImage, this.xCenter - 15, this.flatPosition, increment, increment);
    
    image(timeSig34, this.position34X, this.timeSignatureY - 2, increment + 2, increment * 2 + 5);
    image(timeSig44, this.position44X, this.timeSignatureY, increment, increment * 2 + 5);
    
    
    
  }
}


class Note {
  constructor(x, y, value, accidental) {
    
    //position coordinates 
    this.x = x;
    this.y = y;
    
    //string - "quarter", "half", or "whole"
    this.value = value;
    
    //int - how many seconds the note plays for
    this.duration = 0;
    
    //store the accidental value as a string given the 3 options (sharp, flat, natural)
    this.accidental = accidental;
    
    this.pitch = this.getPitch();
    //width of note head ellipse. should change this variable to "width" oops
    this.length = 1.5 * increment;
    
    //height of note haed ellipse 
    this.height = increment - 5;
    
    //length of note's stem
    this.stemLength = 3 * increment;
    
    //boolean of whether stem is up or down. changes depending on note's position
    this.stemUp = false;
    
  
  }
  
  draw() {
    
    //this if statement - draws note to the canvas only if it is on the staff 
    if (this.x > staff.x1 - increment * 1.5 && this.x < staff.x2) {
      if (
        (this.y > treblePositions[0] - 5 && this.y < treblePositions[14] + 5) ||
        (this.y > bassPositions[0] - 5 && this.y < bassPositions[14] + 5)
      ) {
        //both quarter notes and half notes have stems draw
        if (this.value !== "whole") {
          this.drawStem();
        }
        //quarter notes are filled
        if (this.value === "quarter") {
          fill(0);
          //half notes are not filled
        } else if (this.value === "half") {
          noFill();
        }
        //dotted half notes are not filled
        else if (this.value === "dotted half") {
          ellipse(this.x + this.length / 2 + 10, this.y, 5, 5);
          noFill();
        }
        //whole notes are not filled
        else if (this.value === "whole") {
          stroke(0);
          noFill();
        }
        ellipse(this.x, this.y, this.length, this.height);
      }
    }
    fill(0);
    this.drawAccidental();
    this.drawLedgerLine();
    
    
  }
  drawStem() {
    stroke(0);
    strokeWeight(2.5);
    let yPositionOnStaff =
      round(this.y / (increment / 2)) * (increment / 2) - 5;
    if (
      (yPositionOnStaff >= treblePositions[0] &&
        yPositionOnStaff <= treblePositions[14]) ||
      (yPositionOnStaff >= bassPositions[0] &&
        yPositionOnStaff <= bassPositions[14])
    ) {
      //if note's position is below the third line of the staff, the stem goes above and to the right of the note head
      if (
        (yPositionOnStaff >= treblePositions[9] &&
          yPositionOnStaff <= treblePositions[14]) ||
        yPositionOnStaff >= bassPositions[7] - 5
      ) {
        this.stemUp = true;
      }
      //otherwise, the stem goes below and to the left of the note head
      else {
        this.stemUp = false;
      }
      //the note's stem is drawn in the direction depending on the value of the stemUp
      if (this.stemUp) {
        line(
          this.x + this.length / 2,
          this.y,
          this.x + this.length / 2,
          this.y - this.stemLength
        );
      } else {
        line(
          this.x - this.length / 2,
          this.y,
          this.x - this.length / 2,
          this.y + this.stemLength
        );
      }
    }
  }
  
  drawLedgerLine() {
    stroke(0);
    strokeWeight(2.5);
    let yPositionOnStaff = round(this.y/(increment/2))*(increment/2)-5;
    
    //case-by-case scenarios depending on pitch. Ledger lines appear for notes whose note head don't intersect with the rows of the staff
    //C6 family
    if (yPositionOnStaff === treblePositions[0]) { 
      line(this.x - this.length /2 - 7, this.y, this.x + this.length / 2 + 7, this.y);
      line(this.x - this.length / 2 - 7, this.y + increment, this.x + this.length / 2 + 7, this.y + increment);
    } 
    //B6 family
    else if (yPositionOnStaff === treblePositions[1]) {
      console.log("ledger line is drawn");
      line(this.x - this.length / 2 - 7, this.y + increment / 2, this.x + this.length / 2 + 7, this.y + increment / 2);
    }
    //A6 family
    else if (yPositionOnStaff === treblePositions[2]) {
      line(this.x - this.length / 2 - 7, this.y, this.x + this.length / 2 + 7, this.y);
    }
    //C4 family
    else if (yPositionOnStaff === bassPositions[0] || yPositionOnStaff === treblePositions[14]) {
      line(this.x - this.length / 2 - 7, this.y, this.x + this.length / 2 + 7, this.y);
    }
    //E2 family
    else if (yPositionOnStaff === bassPositions[12]) {
      line(this.x - this.length / 2 - 7, this.y, this.x + this.length / 2 + 7, this.y);
    }
    //D2 family
    else if (yPositionOnStaff === bassPositions[13]) {
      line(this.x - this.length / 2 - 7, this.y - increment / 2, this.x + this.length / 2 + 7, this.y - increment / 2);
    }
    //C2 family
    else if (yPositionOnStaff === bassPositions[14]) {
      line(this.x - this.length / 2 - 7, this.y - increment, this.x + this.length / 2 + 7, this.y - increment);
      line(this.x - this.length /2 - 7, this.y, this.x + this.length / 2 + 7, this.y);
    }
  
  }
  
  drawAccidental() {
  //display the accidental along side the note
    if (this.accidental === "sharp") {
      image(
            sharpImage,
            this.x - this.length - 7,
            this.y - increment / 2,
            increment,
            increment
          );
    }
    else if (this.accidental === "flat") {
      image(flatImage,this.x - this.length - 7, this.y - increment / 2, increment, increment);
    }
  }

  getPitch() {
    /*matches pitches array with positions array for both treble and bass clefs*/
    for (let i = 0; i < treblePositions.length; i++) {
      if (
        round(this.y / (increment / 2)) * (increment / 2) - 5 ===
        treblePositions[i]
      ) {
        this.pitch = treblePitches[i];
        console.log("treblePitches[i]: ", treblePitches[i]);
      }
      if (
        round(this.y / (increment / 2)) * (increment / 2) - 5 ===
        bassPositions[i]
      ) {
        this.pitch = bassPitches[i];
        console.log("bassPitches[i]: ", bassPitches[i]);
      }
    }
    
    /*accidental action */
    for (let i = 0; i < allPitches.length; i++) {
      console.log("got to for loop");
      if (allPitches[i] === this.pitch) {
        console.log("this.pitch is in allPitches!");
        
        //if accidental is flat, lower it a half step by setting its pitch to the next element of allPitches
        if (this.accidental === "flat") {
          this.pitch = allPitches[i + 1];
          console.log("final pitch: ", allPitches[i + 1]);  
        }
        //if accidental is sharp, raise it a half step by setting its pitch to the previous element of allPitches
        else if (this.accidental === "sharp") {
          this.pitch = allPitches[i - 1];
          console.log("final pitch: ", allPitches[i - 1]);  
        }
        //stops the loop and prevents the following notes to take on the same accidenal value
        break;
      }
    }
    return this.pitch;
  }

  
  playNote() {
    
    //again, the larger tempoMultiplier is, the shorter the duration of these notes (because faster tempo) 
    if (this.value == "quarter") {
      if (timeSignature === 4) {
        this.duration = 0.533 / tempoMultiplier;
      }
      else if (timeSignature === 3) {
        this.duration = 0.7 / tempoMultiplier;
      }
      
    }
    else if (this.value == "half") {
      if (timeSignature === 4) {
        this.duration = 1.267 / tempoMultiplier;
      }
      else if (timeSignature === 3) {
        this.duration = 1.75 / tempoMultiplier;
      }
    }
    else if (this.value === "dotted half") {
      if (timeSignature === 4) {
        this.duration = 1.95 / tempoMultiplier;
      }
      else if (timeSignature === 3) {
        this.duration = 2.75 / tempoMultiplier;
      }
    }
    else if (this.value == "whole") {
      this.duration = 2.8 / tempoMultiplier;
    }
    
    //test
    //polySynth.play('C4', 1, 0, 0.2);
    
    polySynth.play(this.pitch, 1, 0, this.duration);
  }

}

//import sound for each note
function setPitchArrays() {
  treblePitches.push("C6");
  treblePitches.push("B6");
  treblePitches.push("A6");
  treblePitches.push("G5");
  treblePitches.push("F5");
  treblePitches.push("E5");
  treblePitches.push("D5");
  treblePitches.push("C5");
  treblePitches.push("B5");
  treblePitches.push("A5");
  treblePitches.push("G4");
  treblePitches.push("F4");
  treblePitches.push("E4");
  treblePitches.push("D4");
  treblePitches.push("C4");

  bassPitches.push("C4");
  bassPitches.push("B4");
  bassPitches.push("A4");
  bassPitches.push("G3");
  bassPitches.push("F3");
  bassPitches.push("E3");
  bassPitches.push("D3");
  bassPitches.push("C3");
  bassPitches.push("B3");
  bassPitches.push("A3");
  bassPitches.push("G2");
  bassPitches.push("F2");
  bassPitches.push("E2");
  bassPitches.push("D2");
  bassPitches.push("C2");
  
  allPitches.push("C#6");
  allPitches.push("C6");
  allPitches.push("B6");
  allPitches.push("A#6");
  allPitches.push("A6");
  allPitches.push("G#5");
  allPitches.push("G5");
  allPitches.push("F#5");
  allPitches.push("F5");
  allPitches.push("E5");
  allPitches.push("D#5");
  allPitches.push("D5");
  allPitches.push("C#5");
  allPitches.push("C5");
  allPitches.push("B5");
  allPitches.push("A#5");
  allPitches.push("A5");
  allPitches.push("G#4");
  allPitches.push("G4");
  allPitches.push("F#4");
  allPitches.push("F4");
  allPitches.push("E4");
  allPitches.push("D#4");
  allPitches.push("D4");
  allPitches.push("C#4");
  allPitches.push("C4");
  allPitches.push("B4");
  allPitches.push("A#4");
  allPitches.push("A4");
  allPitches.push("G#3");
  allPitches.push("G3");
  allPitches.push("F#3");
  allPitches.push("F3");
  allPitches.push("E3");
  allPitches.push("D#3");
  allPitches.push("D3");
  allPitches.push("C#3");
  allPitches.push("C3");
  allPitches.push("B3");
  allPitches.push("A#3");
  allPitches.push("A3");
  allPitches.push("G#2");
  allPitches.push("G2");
  allPitches.push("F#2");
  allPitches.push("F2");
  allPitches.push("E2");
  allPitches.push("D#2");
  allPitches.push("D2");
  allPitches.push("C#2");
  allPitches.push("C2");
  console.log(allPitches);
}


//draws the help menu to the screen
function showHelp() {
  rectMode(CENTER);
  colorMode(RGB, 255, 255, 255, 255);
  fill(100, 100, 100, 200);
  noStroke();
  rect(width / 2, height / 2 - 35, height - 200, height - 205, 10);
  fill(255);
  textSize(40);
  textFont("Georgia");
  text("Can·ta·bi·le", width/2, height / 2 - 215);
  textFont("Garamond");
  textSize(20);
  text("(adj.) in a singing tone", width / 2, height / 2 - 185);
  text("Click on the staff to place \na note at that position.", width / 2, height / 2 - 130);
  text("To change the note value, click on \nthe corresponding icon on \nthe menu on the left.", width / 2, height / 2 - 50);
  text("To place notes with accidentals \n(sharps and flats), click on \nthe menu on the right.", width / 2, height / 2 + 50);
  text("Happy music-making!", width / 2, height / 2 + 130);
  textSize(12);
  text("made with ♡ by Catherine Huang and Catherine Ji, 2020", width / 2, height / 2 + 170);
  
  //displays the "X" button
  image(xOutIcon, width / 2 + (height - 200) / 2 - 30, height / 2 - (height - 200) / 2 - 25, 20, 20);
  
  //resetting things like modes, strokes, and fills 
  rectMode(CORNER);
  colorMode(HSB, 360, 100, 100);
  strokeWeight(4);
  
}