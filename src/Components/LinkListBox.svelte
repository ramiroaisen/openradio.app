<style>
  .link-list-box{
    display: flex;
    flex-direction: column;
    padding-top: 1em;
  }

  .box{
    display: flex;
    flex-direction: column;
    font-size: 1.1em;
    justify-self: center;
    align-self: center;
    width: 600px;
    max-width: 90%;
    background: #fff;
    box-shadow: 0 1px 1px 0 rgba(0,0,0,0.14), 0 2px 1px -1px rgba(0,0,0,0.12), 0 1px 3px 0 rgba(0,0,0,0.2);
    border-top: var(--primary-color) 6px solid;
    border-radius: 3px;
    text-align: center;
    padding: 1em;
  }
  </style>

  <div class="link-list-box">
    <div class="box">
      <slot/>
    </div>
  </div>