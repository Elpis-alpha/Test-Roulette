"use client";
import { chooseFrom, multiplyArray, randomAmong } from "@/source/helpers";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

export default function Home() {
  const originalList = [
    "red",
    "blue",
    "green",
    "yellow",
    "purple",
    "pink",
    "orange",
    "indigo",
    "cyan",
    "teal",
    "lime",
    "gray",
  ];
  const renderedList = multiplyArray(originalList, 30);

  // State for controlling the spin
  const [selectedIndex, setSelectedIndex] = useState<string | number>("random");
  const [chosenItem, setChosenItem] = useState<string>();
  const [isSpinning, setIsSpinning] = useState(false);
  // const [rotation, setRotation] = useState(0);
  const rotationValueRef = useRef<number>(0);
  const rotationRef = useRef<HTMLDivElement>(null);
  const offsetForPreviousSpin = useRef(-0.5);

  const numberOfTicks = 5;
  const audioTick = useRef<HTMLAudioElement[] | null[]>(
    Array(numberOfTicks).fill(null)
  );
  const nextTick = useRef(0);

  const audioEnd = useRef<HTMLAudioElement | null>();
  const audioOpen = useRef<HTMLAudioElement | null>();

  useEffect(() => {
    audioTick.current.forEach((_, i) => {
      audioTick.current[i] = new Audio("/audio/tick_sound.wav");
    });
    audioEnd.current = new Audio("/audio/reveal.wav");
    audioOpen.current = new Audio("/audio/open.wav");
  }, []);

  const playTickSound = async () => {
    await audioTick.current[nextTick.current]?.play();
    nextTick.current = (nextTick.current + 1) % numberOfTicks;
  };

  const widthOfItem = 150;
  const spaceBetweenItems = 24;
  const spacePerItem = widthOfItem + spaceBetweenItems; // Total space per item rotation
  const easeOutQuad = (t: number) => t * (2 - t); // Custom easing function

  const setRotationRef = (value: number) => {
    if (!rotationRef.current) return toast.error("Please wait...");

    const rotationValue = `translateX(-${value}px)`;
    rotationRef.current.style.transform = rotationValue;
    rotationValueRef.current = value;
  };

  const handleSpin = async () => {
    if (isSpinning)
      return toast("The wheel is already spinning!", { icon: "🎡" });
    setIsSpinning(true);
    await audioOpen.current?.play();

    // static values
    const totalDuration = 8000;
    const noChosen = chooseFrom(originalList);
    const numberOfSets = 2; // Number of rotations through the originalList before stopping

    // dynamic values
    let previousSpin = offsetForPreviousSpin.current; // Previous spin offset
    const originalLength = originalList.length; // Length of the original list

    const chosenItemIndex =
      typeof selectedIndex === "number"
        ? selectedIndex
        : originalList.indexOf(noChosen); // Index of the chosen item
    const spaceToChosenItem = chosenItemIndex * spacePerItem; // Space to the chosen item
    const lengthOfSet = originalLength * spacePerItem; // Length of a set
    const minRotation = numberOfSets * lengthOfSet; // Minimum rotation to complete the sets

    const previousSpinOffset = (originalLength - previousSpin) * spacePerItem; // Offset for the previous spin
    offsetForPreviousSpin.current = chosenItemIndex; // Update the offset for the next spin

    const startRotation = rotationValueRef.current; // Start rotation based on the current rotation
    const endRotation =
      startRotation + previousSpinOffset + minRotation + spaceToChosenItem; // End rotation based on the chosen item

    const totalSpinLength = endRotation - startRotation; // Total spin length
    const numberOfTicks = totalSpinLength / spacePerItem; // Number of ticks based on the space per item
    const restartEndRotation = endRotation % lengthOfSet; // End rotation for the restart
    setChosenItem(originalList[chosenItemIndex]); // Set the chosen item

    const startTime = performance.now();
    let previousTick = Math.floor(numberOfTicks) - numberOfTicks; // account for decimal ticks

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / totalDuration, 1); // Clamped to [0, 1]
      const easedProgress = easeOutQuad(progress); // Use easing function for smooth deceleration
      const currentTick = easedProgress * numberOfTicks; // Current tick based on the easing progress

      // Update rotation based on easing
      setRotationRef(startRotation + totalSpinLength * easedProgress);

      // Play the tick sound based on the easing progress
      if (previousTick + 1 < currentTick) {
        playTickSound();
        previousTick = previousTick + 1;
      }

      if (progress < 1) {
        requestAnimationFrame(animate); // Continue animation
      } else {
        setRotationRef(restartEndRotation);
        setIsSpinning(false);
        setChosenItem(undefined);
        audioEnd.current?.play(); // Play end sound after the animation completes
      }
    };

    requestAnimationFrame(animate); // Start the animation loop
  };

  const rotateItemsBy = async (by: number) => {
    if (isSpinning) return toast("The wheel is moving!", { icon: "🎡" });
    setIsSpinning(true);

    const startRotation = rotationValueRef.current;
    const endRotation = startRotation + spacePerItem * by;
    const totalDuration = 500;
    const totalSpinLength = endRotation - startRotation; // Total spin length
    offsetForPreviousSpin.current =
      (offsetForPreviousSpin.current + by) % originalList.length;

    console.log({
      startRotation,
    });
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      console.log("fasas");
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / totalDuration, 1); // Clamped to [0, 1]
      const easedProgress = easeOutQuad(progress); // Use easing function for smooth deceleration

      // Update rotation based on easing
      setRotationRef(startRotation + totalSpinLength * easedProgress);

      if (progress < 1) {
        requestAnimationFrame(animate); // Continue animation
      } else {
        setIsSpinning(false);
      }
    };

    requestAnimationFrame(animate); // Start the animation loop
  };

  const onSelectHandler = (e: any) => {
    const item = e.target.value;
    const itemIndex = originalList.indexOf(item);

    if (itemIndex < 0) setSelectedIndex("random");
    else if (itemIndex >= 0 && itemIndex < originalList.length)
      setSelectedIndex(itemIndex);
    else setSelectedIndex("random");
  };

  return (
    <div className="w-full bg-white">
      <div className="w-full p-10 pb-0 overflow-hidden">
        <div
          ref={rotationRef}
          style={{
            // transform: `translateX(-${rotation}px)`,
            transition: isSpinning ? "transform .05s linear" : "none",
          }}
          className="flex gap-6 w-full items-center justify-center"
        >
          {renderedList.map((col, i) => (
            <div
              key={col + "-" + i}
              className={`bg-${col}-500 w-[150px] h-[150px] flex-none rounded-full text-white flex items-center justify-center shadow-md`}
            >
              {col}-{i}
            </div>
          ))}
        </div>
      </div>
      <div className="w-full relative flex flex-col gap-5 items-center justify-center">
        <div className="marker absolute top-[-150px] bg-black w-1 h-[150px] left-[calc(50%_-_2px)]"></div>
        <button
          onClick={handleSpin}
          className="mt-10 bg-blue-600 text-white px-5 py-2 rounded-md font-bold"
        >
          Spin Roulete
        </button>
        <div className="flex gap-5">
          <button
            onClick={() => rotateItemsBy(-1)}
            className="bg-blue-600 text-white px-5 py-2 rounded-md font-bold"
          >
            -
          </button>
          <button
            onClick={() => rotateItemsBy(1)}
            className="bg-blue-600 text-white px-5 py-2 rounded-md font-bold"
          >
            +
          </button>
        </div>
        <div className="flex flex-col gap-5 items-center">
          <div className="">
            <select
              className="bg-blue-600 text-white px-4 py-3 rounded-md font-bold"
              onChange={onSelectHandler}
            >
              <option value="random">Random</option>
              {originalList.map((item, i) => (
                <option key={item + "-op-" + i} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          {chosenItem && (
            <h1 className={`text-${chosenItem}-500 text-7xl font-black`}>
              {chosenItem.toUpperCase()}
            </h1>
          )}
        </div>
      </div>
      <div
        className="
      bg-red-500 bg-blue-500 bg-green-500 bg-yellow-500 bg-purple-500 bg-pink-500 bg-orange-500 bg-indigo-500 bg-cyan-500 bg-teal-500 bg-lime-500 bg-gray-500
      text-red-500 text-blue-500 text-green-500 text-yellow-500 text-purple-500 text-pink-500 text-orange-500 text-indigo-500 text-cyan-500 text-teal-500 text-lime-500 text-gray-500
       "
      ></div>
    </div>
  );
}
