export class RouterController {
  token = "";
  baseUrl = process.env.CLIENT_BASE_URL;
  headers = {
    Authorization: "",
    "Content-Type": "application/json",
  };

  async connect() {
    let options = {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify({ password: process.env.CLIENT_PASSWORD }),
    };

    let data = await fetch(`${this.baseUrl}/user/login`, options);

    data = await data.json();

    this.token = data.created.token;

    this.headers.Authorization = "Bearer " + this.token;

    console.log("Router: Client connected");
    console.log(`Router: Session token - ${this.token}`);
  }

  async disconnect() {
    await fetch(`${this.baseUrl}/user/3/token/${this.token}`, {
      method: "DELETE",
      headers: this.headers,
    });

    this.token = "";
    this.headers.Authorization = "";

    console.log("Router: Client disconnected");
  }

  async getHosts() {
    console.log("Router: Getting hosts");
    try {
      let data = await fetch(`${this.baseUrl}/network/hosts`, {
        headers: this.headers,
      });
      data = await data.json();

      return data.hosts.hosts;
    } catch (error) {
      await this.disconnect();
      throw error;
    }
  }

  async getMacFilters() {
    console.log("Router: Getting mac filters");
    try {
      let data = await fetch(`${this.baseUrl}/network/macfilters`, {
        headers: this.headers,
      });
      data = await data.json();

      return data.macfilters.rules;
    } catch (error) {
      await this.disconnect();
      throw error;
    }
  }

  async removeFilter(macAddress) {
    try {
      await fetch(`${this.baseUrl}/network/macfilters/${macAddress}`, {
        method: "DELETE",
        headers: this.headers,
      });
      console.log(`Router: macFilter removed - ${macAddress}`);
    } catch (error) {
      console.log(`Router: failed to remove macFilter - ${macAddress}`);
      console.log(error + "\n");
    }
  }

  async createFilter(macAddress, hostname) {
    try {
      const body = {
        filter: {
          hostname: `${hostname} - ${makeid(5)}`,
          enable: true,
        },
      };
      await fetch(`${this.baseUrl}/network/macfilters/${macAddress}`, {
        method: "PUT",
        body: JSON.stringify(body),
        headers: this.headers,
      });
      console.log(`Router: macFilter created - ${macAddress}`);
    } catch (error) {
      console.log(`Router: failed to create macFilter - ${macAddress}`);
      console.log(error + "\n");
    }
  }
}

function makeid(length) {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}
