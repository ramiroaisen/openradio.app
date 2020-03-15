<style>
  .programming{
    box-shadow: rgba(0, 0, 0, 0.14) 0px 1px 1px 0px, rgba(0, 0, 0, 0.12) 0px 2px 1px -1px, rgba(0, 0, 0, 0.2) 0px 1px 3px 0px;
    background: #fff;
    border-radius: 4px;
    display: flex;
    flex-direction: column;
  }

  .label{
    flex: none;
    font-size: 1.1em;
    padding: 1em 1.25em;
    border-bottom: rgba(231,231,231) 1px solid;
  }

  .day{}

  table{
    width: 100%;
    border-collapse: collapse;
    border: none;
  }

  .time{
    white-space: nowrap;
    text-align: center;
  }

  .name{
    width: 100%;
  }

  td{
    padding: 0.6em 0.75em;
  }

  tr:nth-child(odd){
    background: rgb(61, 90, 254, 0.1);
  }
</style>

<script>
  import {Tabs, TabList, Tab, TabPanelList, TabPanel} from "/Components/Tabs/tabs";

  import * as i18n from "/Common/i18n";
  const {trans} = i18n.stores();

  export let programming;

  $: list = Object.entries(programming);

  const h = time => {
    if(time < 12)
      return `${time} am`;
    else
      return `${time - 12} pm`; 
  }

  const dayMap = [6,0,1,2,3,4,5];
  const today = dayMap[new Date().getDay()];
</script>

<div class="programming">
  <div class="label">
    {$trans("station.labels.programming")}
  </div>

  <Tabs>
    <TabList>
      {#each list as [index, day]}
        <Tab selected={index == today}>{$trans(`week.${index}`)}</Tab>
      {/each}
    </TabList>

    <TabPanelList>
      {#each list as [index, day]}
        <TabPanel>
          <div class="day">
            <table>
              <tbody>
                {#each day as entry}
                  <tr>
                    <td class="time">{h(entry.from)} - {h(entry.to)}</td>
                    <td class="name">{entry.name}</td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        </TabPanel>
      {/each}  
    </TabPanelList>
  </Tabs>
</div>

