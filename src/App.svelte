<script>
  import { onMount } from "svelte";
  import { sessions, selectedEvent } from "./stores.js";
  import {
    Button,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
  } from "sveltestrap";
  import { v4 as uuidv4 } from "uuid";
  import Flatpickr from "svelte-flatpickr";
  import "flatpickr/dist/flatpickr.css";
  import "flatpickr/dist/themes/light.css";
  import {
    formatEndTime,
    getWeek,
    validateStartAndEndTimes,
    convertTimestoDatetimes,
  } from "./HelperFunctions";
  import "./Date";
  import { useEffect } from "./Hooks";
  import Notifications from "svelte-notify";
  import { notify } from "svelte-notify";

  const flatpickrOptions = {
    // defaultDate: new Date().toDateString(),
    enableTime: false,
    formatDate: (date, format, locale) => {
      // locale can also be used
      return new Date(date).toDateString();
    },
    minDate: new Date().setHours(0, 0, 0, 0),
  };

  export let isOpen = false, // modal
    isOpenEnd = false, // time dropdown - end
    isOpenStart = false, // time dropdown - start
    date = new Date(),
    week = getWeek(date),
    isEdit = false,
    day = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];

  let events = [],
    currentEvent,
    allEvents = [];

  sessions.subscribe((value) => {
    allEvents = value;
  });

  selectedEvent.subscribe((value) => {
    currentEvent = value;
  });

  onMount(() => {
    // todo, add event listener add/remove listener on screen click
    const timeslots = [...document.querySelectorAll(".time-slot")];
    timeslots.forEach((timeslot) => {
      timeslot.addEventListener("click", createModal);
    });

    const emptyTimeSlots = [...document.querySelectorAll(".empty-time-slot")];
    emptyTimeSlots.forEach((timeslot) => {
      timeslot.addEventListener("click", createModal);
    });
  });

  // whenever events change, add a listener to each div
  useEffect(
    () => {
      const eventDivs = [...document.querySelectorAll(".session")];
      eventDivs.forEach((event) => {
        event.addEventListener("click", editModal);
      });
    }
  ), () => [week];

  // filter al events based on week
  useEffect(
    () => {
      events = allEvents.filter((ev) => {
        var isInWeek = week.map((q) => {
          console.log(q.toDateString(), new Date(ev.date).toDateString())
          return q.toDateString() == new Date(ev.date).toDateString() ? true : false
        });
        console.log(isInWeek)
        return isInWeek.includes(true)

      });
    },
    () => [allEvents]
  );

  const saveEvent = (e) => {
    if (validateStartAndEndTimes(currentEvent)) {
      currentEvent.class = `session-${allEvents.length}`;
      currentEvent.title = currentEvent.title;
      currentEvent.track = currentEvent.track
        ? currentEvent.track
        : currentEvent.date.toLocaleTimeString("en-UK");

      // check if events overlap

      if (!currentEvent.date) {
        notify({
          type: "danger",
          title: "Validation failed" /* Message title */,
          message: "Please select a date",
          timeout: 5000 /* Timeout in millis */,
          showAlways: false /* Boolean */,
        });
        return;
      }

      // validate title
      if (!currentEvent.title) {
        notify({
          type: "danger",
          title: "Validation failed" /* Message title */,
          message: "Please enter a title",
          timeout: 5000 /* Timeout in millis */,
          showAlways: false /* Boolean */,
        });
        return;
      }

      allEvents.push(currentEvent);
      allEvents = allEvents;
      isOpen = false;
      events = allEvents.filter((ev) => {
        var isInWeek = week.map((q) => {
          console.log(q.toDateString(), new Date(ev.date).toDateString())
          return q.toDateString() == new Date(ev.date).toDateString() ? true : false
        });
        console.log(isInWeek)
        return isInWeek.includes(true)

      });
      isEdit = false;
      currentEvent = null;
    } else {
      // create an alert
      notify({
        type: "danger",
        title: "Error, invalid value" /* Message title */,
        message:
          "Please select an end time later than the start time" /* Message */,
        timeout: 5000 /* Timeout in millis */,
        showAlways: false /* Boolean */,
      });
    }
  };

  const deleteEvent = (e) => {
    var eventExists = allEvents.filter((q) => q.id == currentEvent.id);
    if (allEvents.length == 0) {
      notify({
        type: "danger",
        title: "Error" /* Message title */,
        message: "No event to delete" /* Message */,
        timeout: 5000 /* Timeout in millis */,
        showAlways: false /* Boolean */,
      });
    }
    if (eventExists && eventExists.length > 0) {
      allEvents = allEvents.filter((q) => q.id != currentEvent.id);
      allEvents = allEvents;
    }
    isEdit = false;
    toggle();
  };

  // print html
  const renderEvent = (session) => {
    let tempStartTime = convertTimestoDatetimes(
      session.start
    ).toLocaleTimeString("en-UK");
    let tempEndTime = convertTimestoDatetimes(session.end).toLocaleTimeString(
      "en-UK"
    );

    return `<div
    data-date="${session.date}"
    data-title="${session.title}"
    id="${session.id}"
    class="session ${session.class} ${session.track}"
    style="grid-column: ${session.track}; grid-row: ${session.start} / ${
      session.end
    } "
  >
    <h3 class=${session.title ? session.title : ""}>${
      session.title ? session.title : ""
    }</h3>
    <span class="session-time">${tempStartTime.substring(
      0,
      tempStartTime.length - 3
    )} - ${tempEndTime.substring(0, tempEndTime.length - 3)}</span>
    <span class="session-track">${session.track}</span>
  </div>`;
  };

  const renderWeekDay = (weekday, index) => {
    const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
    const firstDate = new Date();

    const diffDays = Math.round(Math.abs((weekday - firstDate) / oneDay));

    return `<span
    class="track-slot"
    id=${weekday.toISOString()}
    style="
    background-color:${diffDays == 0 ? "lightblue;" : "whitesmoke;"} 
    grid-column: ${weekday.toLocaleString("en-us", { weekday: "long" })}; 
    grid-row: tracks;
    font-family: 'Karantina', cursive;
    padding: 10px 5px 5px;
    color: rgb(84, 84, 85);
    position: sticky;
    top: -60px;
    z-index: 1000;
    border-bottom: 1px solid black;
    font-size: 1.5em;
    font-weight: 500;
    "
  ><div>${weekday.toDateString()}</div>
  </span>`;
  };

  const printEmptyDivs = (start, end) =>
    `<div class="empty-time-slot" style="grid-row: time-${start} / time-${end}; grid-column: Monday;"></div>
    <div class="empty-time-slot" style="grid-row: time-${start} / time-${end}; grid-column: Tuesday;"></div>
    <div class="empty-time-slot" style="grid-row: time-${start} / time-${end}; grid-column: Wednesday;"></div>
    <div class="empty-time-slot" style="grid-row: time-${start} / time-${end}; grid-column: Thursday;"></div>
    <div class="empty-time-slot" style="grid-row: time-${start} / time-${end}; grid-column: Friday;"></div>
    <div class="empty-time-slot" style="grid-row: time-${start} / time-${end}; grid-column: Saturday;"></div>
    <div class="empty-time-slot" style="grid-row: time-${start} / time-${end}; grid-column: Sunday;"></div>
  `;

  // toggle beetween weeks
  const getNextWeek = () => {
    date = new Date(
      new Date(date).setDate(new Date(date).getDate() + 7)
    ).toISOString();
    week = getWeek(new Date(date));
  };

  const getPreviousWeek = () => {
    date = new Date(
      new Date(date).setDate(new Date(date).getDate() - 7)
    ).toISOString();
    week = getWeek(new Date(date));
  };

  const getCurrentWeek = () => {
    date = new Date();
    week = getWeek(new Date());
  };

  // open modal toggle
  const toggle = () => (isOpen = !isOpen);

  // open create modal when calender is clicked
  const createModal = (event) => {
    // set the start time in state

    // set date selected in state
    let currentDay = week.filter((weekday) => {
      return (
        weekday.toLocaleString("en-uk", { weekday: "long" }) ==
        event.currentTarget.style.gridColumnStart
      );
    })[0];

    currentDay = currentDay ? currentDay.toISOString() : week[0].toISOString();

    currentEvent = {
      track: event.currentTarget.style.gridColumnStart
        ? event.currentTarget.style.gridColumnStart
        : new Date(currentDay).toLocaleString("en-uk", { weekday: "long" }),
      start: event.currentTarget.style.gridRowStart,
      end: formatEndTime(event.currentTarget.style.gridRowStart),
      date: new Date(currentDay).toDateString(),
      id: uuidv4(),
    };

    // set currentSession.target
    toggle();
  };

  // open edit modal when event is clicked
  const editModal = (event) => {
    isEdit = true;

    event.stopPropagation();

    currentEvent = {
      title: event.currentTarget.dataset.title,
      track: event.currentTarget.style.gridColumnStart,
      start: event.currentTarget.style.gridRowStart,
      end: event.currentTarget.style.gridRowEnd,
      date: event.currentTarget.dataset.date,
      id: event.currentTarget.id,
    };

    // filter by id

    // open modal
    toggle();

    // populate title, starttime and endtime in dd
  };

  const handleTitleChange = (event) => {
    currentEvent.title = event.currentTarget.value;
  };

  // handle dropdown change, update currentEvent
  const handleDDChangeStart = (event, selected) => {
    currentEvent.start == event.currentTarget.value;
  };

  const handleDDChangeEnd = (event, selected) => {
    currentEvent.end == event.currentTarget.value;
  };
</script>

<svelte:head>
  <link rel="preconnect" href="https://fonts.gstatic.com" />
  <script src="https://code.iconify.design/1/1.0.7/iconify.min.js"></script>
  <link
    href="https://fonts.googleapis.com/css2?family=Karantina:wght@300&family=Orelega+One&family=Zen+Dots&display=swap"
    rel="stylesheet"
  />
  <link
    rel="stylesheet"
    href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css"
  />
</svelte:head>

<body>
  <div class="container">
    <div class="text">
      <h1 class="title">Acorn calender</h1>
      <p class="sub-heading">Click on the calender to book an event</p>
      <div class="weekdates" style="padding: 5px;">
        <span>{week[0].toDateString()} - </span>
        <span>{week[6].toDateString()}</span>
      </div>
    </div>

    <div
      style="justify-content: space-between; display: flex; padding: 20px 0px 20px 0px"
    >
      <div style="justify-content: flex-start; display: flex;">
        <button on:click={getCurrentWeek} class="menuButton btn btn-secondary"
          >Today</button
        >
      </div>

      <div style="justify-content: flex-end; display: flex;">
        <button on:click={getPreviousWeek} class="menuButton btn btn-primary"
          >Previous</button
        >
        <button on:click={getNextWeek} class="menuButton btn btn-secondary"
          >Next</button
        >
      </div>
    </div>

    <div class="schedule" aria-labelledby="schedule-heading">
      {#each week as weekday}
        {@html renderWeekDay(weekday)}
      {/each}

      <!-- timeslots x axis -->
      <p class="time-slot" style=" grid-row: time-0900;">9:00am</p>
      {#each events.filter((q) => q.start == "time-0900") as session}
        {@html renderEvent(session)}
      {/each}
      {@html printEmptyDivs("0900", "0930")}
      <p class="time-slot" style="grid-row: time-0930 / time-0930;">9:30am</p>
      {#each events.filter((q) => q.start == "time-0930") as session}
        {@html renderEvent(session)}
      {/each}
      {@html printEmptyDivs("0930", "1000")}
      <p class="time-slot" style="grid-row: time-1000;">10:00am</p>
      {#each events.filter((q) => q.start == "time-1000") as session}
        {@html renderEvent(session)}
      {/each}
      {@html printEmptyDivs("1000", "1030")}
      <p class="time-slot" style="grid-row: time-1030;">10:30am</p>
      {#each events.filter((q) => q.start == "time-1030") as session}
        {@html renderEvent(session)}
      {/each}
      {@html printEmptyDivs("1030", "1100")}
      <p class="time-slot" style="grid-row: time-1100;">11:00am</p>
      {#each events.filter((q) => q.start == "time-1100") as session}
        {@html renderEvent(session)}
      {/each}
      {@html printEmptyDivs("1100", "1130")}
      <p class="time-slot" style="grid-row: time-1130;">11:30am</p>
      {#each events.filter((q) => q.start == "time-1130") as session}
        {@html renderEvent(session)}
      {/each}
      {@html printEmptyDivs("1130", "1200")}
      <p class="time-slot" style="grid-row: time-1200;">12:00am</p>
      {#each events.filter((q) => q.start == "time-1200") as session}
        {@html renderEvent(session)}
      {/each}
      {@html printEmptyDivs("1200", "1230")}
      <p class="time-slot" style="grid-row: time-1230;">12:30am</p>
      {#each events.filter((q) => q.start == "time-1230") as session}
        {@html renderEvent(session)}
      {/each}
      {@html printEmptyDivs("1230", "1300")}
      <p class="time-slot" style="grid-row: time-1300;">13:00am</p>
      {#each events.filter((q) => q.start == "time-1300") as session}
        {@html renderEvent(session)}
      {/each}
      {@html printEmptyDivs("1300", "1330")}
      <p class="time-slot" style="grid-row: time-1330;">13:30am</p>
      {#each events.filter((q) => q.start == "time-1330") as session}
        {@html renderEvent(session)}
      {/each}
      {@html printEmptyDivs("1330", "1400")}
      <p class="time-slot" style="grid-row: time-1400;">14:00pm</p>
      {#each events.filter((q) => q.start == "time-1400") as session}
        {@html renderEvent(session)}
      {/each}
      {@html printEmptyDivs("1400", "1430")}
      <p class="time-slot" style="grid-row: time-1430;">14:30pm</p>
      {#each events.filter((q) => q.start == "time-1430") as session}
        {@html renderEvent(session)}
      {/each}
      {@html printEmptyDivs("1430", "1500")}
      <p class="time-slot" style="grid-row: time-1500;">15:00pm</p>
      {#each events.filter((q) => q.start == "time-1500") as session}
        {@html renderEvent(session)}
      {/each}
      {@html printEmptyDivs("1500", "1530")}
      <p class="time-slot" style="grid-row: time-1530;">15:30pm</p>
      {#each events.filter((q) => q.start == "time-1530") as session}
        {@html renderEvent(session)}
      {/each}
      {@html printEmptyDivs("1530", "1600")}
      <p class="time-slot" style="grid-row: time-1600;">16:00pm</p>
      {#each events.filter((q) => q.start == "time-1600") as session}
        {@html renderEvent(session)}
      {/each}
      {@html printEmptyDivs("1600", "1630")}
      <p class="time-slot" style="grid-row: time-1630;">16:30pm</p>
      {#each events.filter((q) => q.start == "time-1630") as session}
        {@html renderEvent(session)}
      {/each}
      {@html printEmptyDivs("1630", "1700")}
      <p class="time-slot" style="grid-row: time-1700;">17:00pm</p>
      {#each events.filter((q) => q.start == "time-1700") as session}
        {@html renderEvent(session)}
      {/each}
      {@html printEmptyDivs("1700", "1730")}
      <p class="time-slot" style="grid-row: time-1730;">17:30pm</p>
    </div>

    <!-- edit event modal -->
    <Modal {isOpen} {toggle}>
      <ModalHeader {toggle}>Book a session</ModalHeader>
      <ModalBody>
        <div>
          <Notifications />
          <div>
            <p>Please choose a title</p>
            <input
              on:change={handleTitleChange}
              bind:value={currentEvent.title}
            />
          </div>
          <div style="padding: 20px 0px 20px 0px">
            <p>Please choose a date</p>
            <Flatpickr
              on:change={(event) => {
                currentEvent.track = new Date(
                  event.detail[0][0]
                ).toLocaleString("default", { weekday: "long" });
                currentEvent.date = new Date(event.detail[0][0]).toISOString();
              }}
              options={flatpickrOptions}
              bind:value={currentEvent.date}
            />
          </div>
          <div class="dds_time_container">
            <p>Please choose the start and end time</p>
            <div class="dds_time">
              <select
                id="dd_start_time"
                class="dd_time"
                on:change={handleDDChangeStart}
                bind:value={currentEvent.start}
              >
                <option value={"time-0900"}>09:00</option>
                <option value={"time-0930"}>09:30</option>
                <option value={"time-1000"}>10:00</option>
                <option value={"time-1030"}>10:30</option>
                <option value={"time-1100"}>11:00</option>
                <option value={"time-1130"}>11:30</option>
                <option value={"time-1200"}>12:00</option>
                <option value={"time-1230"}>12:30</option>
                <option value={"time-1300"}>13:00</option>
                <option value={"time-1330"}>13:30</option>
                <option value={"time-1400"}>14:00</option>
                <option value={"time-1430"}>14:30</option>
                <option value={"time-1500"}>15:00</option>
                <option value={"time-1530"}>15:30</option>
                <option value={"time-1600"}>16:00</option>
                <option value={"time-1630"}>16:30</option>
                <option value={"time-1700"}>17:00</option>
              </select>
              <select
                id="dd_end_time"
                class="dd_time"
                onchange={handleDDChangeEnd}
                bind:value={currentEvent.end}
              >
                <option value={"time-0930"}>09:30</option>
                <option value={"time-1000"}>10:00</option>
                <option value={"time-1030"}>10:30</option>
                <option value={"time-1100"}>11:00</option>
                <option value={"time-1130"}>11:30</option>
                <option value={"time-1200"}>12:00</option>
                <option value={"time-1230"}>12:30</option>
                <option value={"time-1300"}>13:00</option>
                <option value={"time-1330"}>13:30</option>
                <option value={"time-1400"}>14:00</option>
                <option value={"time-1430"}>14:30</option>
                <option value={"time-1500"}>15:00</option>
                <option value={"time-1530"}>15:30</option>
                <option value={"time-1600"}>16:00</option>
                <option value={"time-1630"}>16:30</option>
                <option value={"time-1700"}>17:00</option>
                <option value={"time-1730"}>17:30</option>
              </select>
            </div>
          </div>
          <div />
        </div>
      </ModalBody>
      <ModalFooter>
        <div
          style="display: flex; justify-content: space-between; width: 100%;"
        >
          {#if isEdit}
            <Button on:click={deleteEvent}
              ><span
                class="iconify"
                data-icon="mdi-delete"
                data-inline="false"
              /></Button
            >
          {/if}
          <div style="display: flex; justify-content: flex-end;">
            <Button color="primary" on:click={saveEvent}>Save event</Button>
            <Button
              color="secondary"
              on:click={() => {
                isEdit = false;
                toggle();
              }}>Cancel</Button
            >
          </div>
        </div>
      </ModalFooter>
    </Modal>
  </div>
</body>

<!-- use lang="sass" for SASS -->
<style lang="scss">
  :global(::-webkit-scrollbar) {
    width: 12px; /* width of the entire scrollbar */
  }

  :global(::-webkit-scrollbar-track) {
    background: rgb(245, 245, 245); /* color of the tracking area */
  }

  :global(::-webkit-scrollbar-thumb) {
    background-color: rgb(53, 53, 54); /* color of the scroll thumb */
    border-radius: 20px; /* roundness of the scroll thumb */
    border: 1px solid rgb(32, 32, 32); /* creates padding around scroll thumb */
  }

  .schedule p {
    font-family: "Karantina", cursive;
    font-size: 1.3em;
  }

  :global(.session h3) {
    font-size: 1em;
  }

  :global(.session span) {
    font-size: 0.8em;
  }

  @media screen and (max-width: 700px) {
    :global(.session) {
      padding: 20px 20px !important;
      margin: 20px 20px 20px 0px !important;
    }

    :global(.title) {
      padding: 0px;
      margin: 0px !important;
    }
  }

  :global(.dd_time:first-child) {
    padding-right: 10px;
  }

  :global(.dds_time) {
    display: flex;
    padding-bottom: 10px;
    flex-direction: row;
  }

  @media screen and (min-width: 700px) {
    :global(.dropdown-menu) {
      overflow: scroll !important;
      max-height: 200px !important;
    }

    :global(.weekdates) {
      position: relative;
      display: flex;
      justify-content: center;
      font-family: "Karantina", cursive;
      font-size: 2em;
      font-weight: normal;
    }

    :global(.dds_time_container) {
      padding: 10px 0px;
    }

    :global(.session) {
      padding: 0.5em;
      border-radius: 2px;
      box-shadow: rgba(255, 255, 255, 1) 0px 0px 0, rgba(0, 0, 0, 1) 0px 0px 0;
      border-radius: 5px;
      color: white;
      display: flex;
      flex-direction: column;
    }

    :global(.session *) {
      padding: 5px 0px;
    }

    .schedule {
      cursor: pointer;
      overflow: scroll;
      background-color: whitesmoke;
      display: grid;
      grid-template-rows:
        [tracks] auto
        [time-0900] 1fr
        [time-0930] 1fr
        [time-1000] 1fr
        [time-1030] 1fr
        [time-1100] 1fr
        [time-1130] 1fr
        [time-1200] 1fr
        [time-1230] 1fr
        [time-1300] 1fr
        [time-1330] 1fr
        [time-1400] 1fr
        [time-1430] 1fr
        [time-1500] 1fr
        [time-1530] 1fr
        [time-1600] 1fr
        [time-1630] 1fr
        [time-1700] 1fr;
      /* Note 1:
			Use 24hr time for gridline names for simplicity

			Note 2: Use "auto" instead of "auto" for a more compact schedule where height of a slot is not proportional to the session length. Implementing a "compact" shortcode attribute might make sense for this!
			Try 0.5fr for more compact equal rows. I don't quite understand how that works :)
			*/

      grid-template-columns:
        [times] 3em
        [Monday-start] auto
        [Monday-end Tuesday-start] auto
        [Tuesday-end Wednesday-start] auto
        [Wednesday-end Thursday-start] auto
        [Thursday-end Friday-start] auto
        [Friday-end Saturday-start] auto
        [Saturday-end Sunday-start] auto
        [Sunday-end];
    }
  }

  .time-slot {
    grid-column: times;
    position: relative;
    left: -1px;
    padding: 10px;
    text-decoration: underline;
  }

  :global(.track-slot) {
    display: none; /* hidden on small screens and browsers without grid support */
  }

  @supports (display: grid) {
    @media screen and (min-width: 700px) {
      .time-slot:first-of-type {
        border-top: 1px solid black;
        margin-top: -2px;
        position: relative;
      }

      .track-slot:first-of-type {
        border-left: 1px solid black;
        margin-left: -2px;
        position: sticky;
      }

      .time-slot {
        border-right: 1px solid black;
        text-decoration: none !important;
        color: rgb(84, 84, 85);
      }

      :global(.track-slot) {
        cursor: initial;
        font-family: "Karantina", cursive;
        display: block;
        padding: 10px 5px 5px;
        color: rgb(84, 84, 85);
        position: sticky;
        top: -60px;
        z-index: 1000;
        background-color: rgba(255, 255, 255, 1);
        border-bottom: 1px solid black;
        font-size: 1.5em;
      }
    }
  }

  /* Small-screen & fallback styles */
  .session {
    margin-bottom: 1em;
    box-shadow: 0 8px 6px 6px black;
  }

  @supports (display: grid) {
    @media screen and (min-width: 700px) {
      .session {
        margin: 0;
      }
    }
  }

  /*************************
 * VISUAL STYLES
 * Design-y stuff ot particularly important to the demo
 *************************/
  body {
    padding: 20px;
    max-width: 1100px;
    margin: 0 auto;
    line-height: 1.5;
    color: rgb(34, 33, 33);
  }

  .menuButton {
    margin: 5px;
  }

  .session-title,
  .session-time,
  .session-track,
  .session-presenter {
    display: block;
  }

  .session-title,
  .time-slot {
    margin: 0;
  }

  .session-title a {
    color: #fff;
    text-decoration-style: dotted;

    &:hover {
      font-style: italic;
    }

    &:focus {
      outline: 2px dotted rgba(255, 255, 255, 0.8);
    }
  }

  .track-slot,
  .time-slot {
    font-weight: bold;
    background-color: whitesmoke;
  }

  :global(.session) {
    background-color: #031e3f;
    color: #fff;
    z-index: 10;
    position: relative;
  }

  .track-all {
    display: flex;
    justify-content: center;
    align-items: center;
    background: #ccc;
    color: #000;
    box-shadow: none;
  }

  .meta {
    color: #555;
    font-style: italic;
  }

  .meta a {
    color: #555;
  }

  hr {
    margin: 40px 0;
  }

  .title {
    font-family: "Karantina", cursive;
    background-color: rgb(143, 1, 1);
    color: white;
    margin: 1em;
    margin-bottom: 0.25em;
    margin-top: 0em;
    font-size: 4em;
    justify-content: center;
    display: flex;
    padding: 5px;
  }

  .sub-heading {
    font-family: "Karantina", cursive;
    color: rgb(0, 0, 0);
    margin: 1em;
    font-size: 2em;
    margin-bottom: 0.25em;
    margin-top: 0em;
    justify-content: center;
    display: flex;
    padding: 5px;
  }

  :global(.btn-primary) {
    border: none !important;
    background-color: #031e3f !important;
  }

  :global(.dd_time:first-child .btn-secondary) {
    border: none !important;
    background-color: #031e3f !important;
  }

  :global(.btn-secondary) {
    border: none !important;
    background-color: #8f0101 !important;
  }
</style>
